

import Button from '@mui/material/Button';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import axios from 'axios';
import apiConfig from '../configs/apiConfig';
import Alert from '@mui/material/Alert';
import {createdAt} from './timeHelpers';
 
 
export const dataUpload = (data) => {
    try {   

 

        return true
      
       }catch(error){
         // next(error)
       }
  };