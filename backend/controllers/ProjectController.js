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
        }
      },
      orderBy: { created_at: 'desc' }
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
    const updated_by = user_id;
    const { name, description, pc_count, status } = req.body;
    const now = created_at(); // Get current timestamp

    const project = await prisma.projects.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        //pc_count,
        status,
        updated_by,
        updated_at: now // Set updated_at to current time
        // created_at remains unchanged from original value
      }
    });

    const result = {
      ...project,
      created_at: timeBeauty(project.created_at),
      updated_at: timeBeauty(project.updated_at)
    };

    response.update({ count: project ? 1 : 0, data: result }, res);
  } catch (error) {
    response.error(error, res, next);
  }
};