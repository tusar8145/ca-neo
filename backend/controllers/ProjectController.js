import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { user_id } from '../middleware/Auth.js';
import { created_at,timeBeauty } from '../helpers/Timer.js';
import * as response from "../helpers/Response.js";

export const list = async (req, res, next) => {
  try {
    const created_by = user_id;
    const projects = await prisma.projects.findMany({  // plural here
     // where: { created_by },
      include: {
        certificates: {
          select: { serial: true, status: true, pc_identifier: true }
        },
        admin_projects:{
          include:{admin:{select:{
            id:true, name:true
          }}}
        }
      },
      orderBy: { id: 'desc' }
    });

    const result = projects.map(project => ({
      ...project,
      created_at: timeBeauty(project.created_at),
      updated_at: timeBeauty(project.updated_at)
    }));

    response.list({ count: projects.length, data: result }, res);
  } catch (error) {
    response.error(error, res, next);
  }
};

export const show = async (req, res, next) => {
  try {
    const { id } = req.params;
    const created_by = user_id;

    const project = await prisma.projects.findFirst({  // plural here
      where: { id: parseInt(id), created_by },
      include: {
        certificates: {
          include: {
            logs: {
              take: 5,
              orderBy: { created_at: 'desc' }
            }
          }
        }
      }
    });

    if (!project) {
      return response.notFound('Project not found', res);
    }

    const result = {
      ...project,
      created_at: timeBeauty(project.created_at),
      updated_at: timeBeauty(project.updated_at),
      certificates: project.certificates.map(cert => ({
        ...cert,
        issued_at: timeBeauty(cert.issued_at),
        expires_at: timeBeauty(cert.expires_at)
      }))
    };

    response.list(result, res);
  } catch (error) {
    response.error(error, res, next);
  }
};


export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated_by = req.user.id; // Assuming user_id comes from authenticated user
    const { name, description, pc_count, status, staff_ids } = req.body;
    const now = new Date();

    // First update the project details
    const project = await prisma.projects.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        pc_count: parseInt(pc_count),
        status,
        updated_by,
        updated_at: now
      }
    });

    // Handle staff_ids if provided
    if (staff_ids !== undefined) {
      // Validate staff_ids
      if (staff_ids && staff_ids.length > 0) {
        const existingAdmins = await prisma.admins.findMany({
          where: {
            id: { in: staff_ids }
          },
          select: { id: true }
        });

        if (existingAdmins.length !== staff_ids.length) {
          const missingIds = staff_ids.filter(id => 
            !existingAdmins.some(admin => admin.id === id)
          );
          return res.status(400).json({
            error: 'Invalid staff_ids',
            message: `The following staff IDs do not exist: ${missingIds.join(', ')}`
          });
        }
      }

      // Get current associations
      const currentAssociations = await prisma.admin_projects.findMany({
        where: { project_id: project.id }
      });

      // Determine associations to add and remove
      const currentStaffIds = currentAssociations.map(a => a.admin_id);
      const staffIdsToAdd = staff_ids.filter(id => !currentStaffIds.includes(id));
      const staffIdsToRemove = currentStaffIds.filter(id => !staff_ids.includes(id));

      // Perform deletions if needed
      if (staffIdsToRemove.length > 0) {
        await prisma.admin_projects.deleteMany({
          where: {
            project_id: project.id,
            admin_id: { in: staffIdsToRemove }
          }
        });
      }

      // Perform additions if needed
      if (staffIdsToAdd.length > 0) {
        await prisma.admin_projects.createMany({
          data: staffIdsToAdd.map(admin_id => ({
            project_id: project.id,
            admin_id
          })),
          skipDuplicates: true
        });
      }
    }

    // Get updated project with staff associations
    const updatedProject = await prisma.projects.findUnique({
      where: { id: project.id },
      include: {
        admin_projects: {
          select: {
            admin_id: true
          }
        }
      }
    });

    const result = {
      ...updatedProject,
      created_at: timeBeauty(updatedProject.created_at),
      updated_at: timeBeauty(updatedProject.updated_at),
      staff_ids: updatedProject.admin_projects.map(ap => ap.admin_id)
    };

    response.update({ 
      count: 1, 
      data: result 
    }, res);
  } catch (error) {
    response.error(error, res, next);
  }
};