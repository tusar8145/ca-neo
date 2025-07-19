import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import BallotIcon from '@mui/icons-material/Ballot';
import PendingIcon from '@mui/icons-material/Pending';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Fingerprint from '@mui/icons-material/Fingerprint';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import '../../../styles/table-html.css';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import { lazy,useEffect } from 'react';
import Button from '@mui/material/Button';
import CIcon from '@mui/icons-material/ChevronRight';
import Edit from '@mui/icons-material/Edit';
import Article from '@mui/icons-material/Article';
import OpenInNew from '@mui/icons-material/OpenInNew';
import CorporateFare from '@mui/icons-material/CorporateFare';
import Grid from '@mui/material/Grid';
import {createdAt} from '../../helpers/timeHelpers';
import { useTheme } from '../../context/ThemeContext';
import {   useState } from 'react';

import InfoIcon from '@mui/icons-material/Info';
 import Tooltip from '@mui/material/Tooltip';

const DPCEditModal = lazy(() => import('../modal/DPCEditModal'));

export default function TablePatient(props) {
	const { hospital, toggleHospital } = useTheme();

  function dateToExcelSerial(date) {
    
    // Excel's start date (January 1, 1900)
    const excelStartDate = new Date(Date.UTC(1900, 0, 1));
    
    // Calculate the difference in milliseconds
    const diffInMillis = date - excelStartDate;
    
    // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 milliseconds)
    const diffInDays = Math.floor(diffInMillis / (24 * 60 * 60 * 1000));
    console.log('vvvvvv444',date,excelStartDate)
    // Excel serial number starts from 1 for January 1, 1900
    return diffInDays + 2; // Adding 2 because January 1, 1900 is serial number 1, and there is a leap year bug (Feb 29, 1900)
  }

  function excelSL(serial){
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
  
    const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  
    let totalSeconds = Math.floor(86400 * fractionalDay);
  
    let seconds = totalSeconds % 60;
  
    totalSeconds -= seconds;
  
    let hours = Math.floor(totalSeconds / (60 * 60));
    let minutes = Math.floor(totalSeconds / 60) % 60;   

    var year    = dateInfo.getFullYear()  
    var month   = dateInfo.getMonth()+1
    var day     = dateInfo.getDate()

    if(month.toString().length == 1) {
        month = '0'+month;
   }
   if(day.toString().length == 1) {
        day = '0'+day;
   }   

    return  year+'/'+month+'/'+day;
  }


  function calculateHospitalizationDays(admissionDate,discharge_date,dates) {

          try {
                    const admission = new Date(admissionDate);
                    let today = null

                    if(discharge_date){
                      let dates_obj=[]
                      let latest_date=null

                      if(dates){dates_obj=JSON.parse(dates)}
                      latest_date=dates_obj[dates_obj?.length-1]

                      let date_latest=excelSL(latest_date)

                      const x = new Date(date_latest);
                      const y = new Date(discharge_date);

                     // console.log('vvvvvv',date_latest,discharge_date)

                      if(x>y){
                        today=new Date()
                      }else{
                        today=new Date(discharge_date)
                      }

                      }else{
                        today=new Date();
                      }

                    const differenceInTime = today.getTime() - admission.getTime();
                    const differenceInDays = differenceInTime / (1000 * 3600 * 24)+1;
                    return parseInt(differenceInDays);    
          } catch (error) {
            return 0; 
          }
  }


    const { t } = useTranslation('shared-components');
    const [value, setValue] = React.useState(0);
    const [edit, setEdit] = React.useState(0);
    const [judge, setJudge] = React.useState(0);

    const [line, setLine] = React.useState(false);

    const [PatientDpcMeasureData, setPatientDpcMeasureData] = React.useState([]);

    const [dpc_current, setdpc_current] = React.useState(null);

    async function verify(id,is_verified) {
      try {
          console.log(id,is_verified)
          const result = await axios.post(apiConfig.PatientDpcVerify, {id:id, is_verified:is_verified});
          props.verify()
          
      } catch (error) {
        console.log(error)
        
      }
    }


    let data=props.data

    function part3(a,b,c,d){
      return (
          <span style={{display: "flex"}} className='dpc'> 
            {c==null?  <div  style={(c==null || c=='')? {color : 'red'}:{color : '未'}}  className=' '  >{'未'}</div> : <div style={(c==null || c=='未')? {color : 'red'}:{color : ''}}  className=' '>{c}</div>  }
        
            {d &&
              <div  className='fxl  ' > / </div>
            }
            {d &&
              <div  style={d=='未'? {color : 'red'}:{color : ''}}   className=' '>{d}</div>  
            }
          </span>
      )
    }

 








    function UpdateComplete(para) {
      props.verify()
     // setIsRefetching(true)
    }

    /*function changeEdit() {
      if(edit==1){
        setEdit(0)
      }else{
        setEdit(1)
      }
    }*/






    async function PatientDpcMeasure(data,hospital_id) {

      let a_dpc_6=null
      let a_and_1=null
      let a_age_1=null
      let a_sur_2=null
      let a_tre1_1=null
      let a_tre2_1=null
      let a_sec_1=null
      let a_sco_1=null


      if(data.s_dpc_6){a_dpc_6=data.s_dpc_6}else{ a_dpc_6=data.dpc_6}
      if(data.s_and_1){a_and_1=data.s_and_1}else{ a_and_1=data.and_1}
      if(data.s_age_1){a_age_1=data.s_age_1}else{ a_age_1=data.age_1}
      if(data.s_sur_2){a_sur_2=data.s_sur_2}else{ a_sur_2=data.sur_2}
      if(data.s_tre1_1){a_tre1_1=data.s_tre1_1}else{ a_tre1_1=data.tre1_1}
      if(data.s_tre2_1){a_tre2_1=data.s_tre2_1}else{ a_tre2_1=data.tre2_1}
      if(data.s_sec_1){a_sec_1=data.s_sec_1}else{ a_sec_1=data.sec_1}
      if(data.s_sco_1){a_sco_1=data.s_sco_1}else{ a_sco_1=data.sco_1}
 

       const response = await axios.post(apiConfig.PatientDpcMeasure, {dpc_code:a_dpc_6+a_and_1+a_age_1+a_sur_2+a_tre1_1+a_tre2_1+a_sec_1+a_sco_1,hospital_id:hospital_id});
      console.log(response.data.data,'jjjjjjjjjj')
      let getd=response.data.data
      let res=[]

      if(getd?.res1>0 && getd.error!=1){  res.res1=getd.res1   }else{res.res1='未'}
      if(getd?.res2>0 && getd.error!=1){  res.res2=getd.res2   }else{res.res2='未'}
      if(getd?.res3>0 && getd.error!=1){  res.res3=getd.res3   }else{res.res3=''}
      res.ccpm=getd.ccpm
      res.error=getd?.error

    

      setPatientDpcMeasureData(res)
    }



    function validSurgery (current_sur,codes) {
     
   try {
       const array = codes.split(',');
      let have_atleast1=false

      let t1=0
      for(let i=0; i<array.length; i++){
        let t_code=array[i]
        let x_sur_2  =t_code.substring(8, 10).toUpperCase();

        if(current_sur==x_sur_2){
            t1=1
        }else{
          
        }
      }
      if(t1==0){
        return false;
      } else{
        return true;
      }   
   } catch (error) {
    
   }

    }


    function yesCanbe(current_sur,codes,name_colm,req_option) {

     try {
      req_option=req_option.toUpperCase()

      const array = codes.split(',');
      let have_atleast1=false

      let t1=0
      for(let i=0; i<array.length; i++){
        let t_code=array[i]
        let x_sur_2  =t_code.substring(8, 10).toUpperCase();

        if(current_sur==x_sur_2){
            t1=1
        }else{
          
        }
      }
      if(t1==0){
        return true;
      }

      for(let i=0; i<array.length; i++){
        let t_code=array[i]

        let x_dpc_6  =t_code.substring(0, 6);
        let x_and_1  =t_code.substring(6, 7).toUpperCase();
        let x_age_1  =t_code.substring(7, 8).toUpperCase();
        let x_sur_2  =t_code.substring(8, 10).toUpperCase();
        let x_tre1_1 =t_code.substring(10, 11).toUpperCase();
        let x_tre2_1 =t_code.substring(11, 12).toUpperCase();
        let x_sec_1  =t_code.substring(12, 13).toUpperCase();
        let x_sco_1  =t_code.substring(13, 14).toUpperCase();

        

        if(name_colm=='and_1'){  
          if(current_sur==x_sur_2) { 
             if(req_option==x_and_1){console.log('pppppp2',current_sur,x_sur_2,req_option,x_and_1)
              return true;
              have_atleast1=true
            }
          }
        }if(name_colm=='age_1'){  
          if(current_sur==x_sur_2) { 
             if(req_option==x_age_1){
              return true;
              have_atleast1=true
            }
          }
        }if(name_colm=='tre1_1'){  
          if(current_sur==x_sur_2) {
             if(req_option==x_tre1_1){
              return true;
              have_atleast1=true
            }
          }
        }
        else if(name_colm=='tre2_1'){  
          if(current_sur==x_sur_2) {
             
            if(req_option==x_tre2_1){
               return true;
               have_atleast1=true
            }
          }
        }
        else if(name_colm=='sec_1'){  
          if(current_sur==x_sur_2) {
             if(req_option==x_sec_1){
              return true;
              have_atleast1=true
            }
          }
        }else if(name_colm=='sco_1'){  
          if(current_sur==x_sur_2) {
             if(req_option==x_sco_1){
              return true;
              have_atleast1=true
            }
          }
        } 
        else{
          have_atleast1=false
        }
      }


      return have_atleast1;
     } catch (error) {
      
     }

    
    }


    useEffect(() => {
      PatientDpcMeasure(data,hospital.id)
    }, [data,hospital]);
     
    const [bgColor, setBgColor] = useState('white');
    const handleTableClick = () => {
      if(bgColor=='aquamarine'){
        setBgColor('white'); 
      }else{
        setBgColor('aquamarine'); 
      }
     // Change this color as needed
    };


    useEffect(() => {

      if(data.discharge_date && data.arr_date){

        let latest_date=null
        let dates_obj=null
        let dates=data.arr_date
        if(dates){dates_obj=JSON.parse(dates)}
        latest_date=dates_obj[dates_obj?.length-1]

        let date_latest=excelSL(latest_date)
 
            var date1 = new Date(date_latest)
            var date2 = new Date(data.discharge_date);

            if(date1>date2){
                console.log('vvvvvvvvvvvv',  date1, date2 )
                setLine(true)
            }

           // var diffDays = date2.getDate() - date1.getDate();  
            
           // setLine(diffDays)
            
      }
     

      
 
    }, [data.discharge_date && data.arr_date]);

    return ( 
    <table  style={{ backgroundColor: bgColor, borderCollapse: 'collapse', width: '100%' }}
        onClick={handleTableClick} className={`dpc dpc-table p-10 mt-2    transition ease-in-out   bg-white hover:-translate-y-1 hover:scale-104 hover:bg-white-50 duration-300 ${props.basic ==1 ? 'bgblanchedalmond' : ''}`} >
       

        <tr>
            <td className={"width_single text-center new_t_color_head "}rowSpan={2}> {props.sl} </td>
            <td className={"width_double  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}>{part3('患者', 'コード', data.patient_code, null)}</td>
            <td className={"width_double  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}>{part3('名前', null, data.doctor, null)}</td>
            <td className={"width_single  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}>{part3('病棟', null, data.ward, null)}</td>
            <td className={"width_double  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}>{part3('入院日', null, data.admission_date, null)}</td>
            <td className={"width_double  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular') + (line==true?'  line-through   ':'')}
            >  
     
              {part3('退院', '予定日', data.discharge_date, null)}  
            </td>
            <td className={"width_single  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}>{part3('入院', '日数', calculateHospitalizationDays(data.admission_date_gap,data.discharge_date,data.arr_date), null)}</td>
            <td className={"width_single  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}> 
<div class="flex justify-between ...">
  <div>
    {part3('今期', '患者数', PatientDpcMeasureData?.res1, null)}
  </div>
  <div className='cursor-pointer'>
    
    {PatientDpcMeasureData?.ccpm &&

                  <Tooltip title={PatientDpcMeasureData?.ccpm}>
                     
                      <InfoIcon />
                    
                  </Tooltip>
    }

  </div>
</div>


            </td>
            <td className={"width_single  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}>{part3('過去', '患者数', PatientDpcMeasureData?.res2, null)}</td>
            <td className={"width_single  " + (PatientDpcMeasureData?.error==1 ? 'new_t_color_incomplete' : 'new_t_color_regular')}>
            {PatientDpcMeasureData?.res3?
            part3('入院', '期間Ⅱ', PatientDpcMeasureData?.res3, null) :

            <>
            出来高
            </>
          
             }

            {}
            
            </td>
            <td className={" width_button text-center border-right-zero "} style={{"border-bottom":"0px"}} rowSpan={2}>
            <div class="flex justify-between ...">

              {data.is_verified == 1 ?
                <IconButton aria-label="fingerprint"
                  onClick={() => {
                    verify(data.id, 0)
                  }}
                  color="success"><Fingerprint /></IconButton> : <IconButton aria-label="PendingIcon"
                    onClick={() => {
                      verify(data.id, 1)
                    }}

                    color="error"><PendingIcon /></IconButton>
              }  

              <IconButton color="secondary"  size="small"  aria-label="add an alarm"   onClick={() => {
                if (edit == 1) {
                  setEdit(0)
                } else {
                  setEdit(1)
                }
              }}>
                <Edit />
              </IconButton>
 

              {props.basic != 1 &&    
              <IconButton color="secondary"  size="small"  aria-label="add an alarm"  onClick={() => {
                localStorage.setItem("ld", data.id)
                let queryParameters = new URLSearchParams(window.location.search)
                let page=queryParameters.get('page') || 0;

                let hospitalization=queryParameters.get('hospitalization-days')
                let urls='?page='+page+'&query='+data.id
                
                if(hospitalization){
                  urls=urls+'&hospitalization-days='+hospitalization
                }

                //queryParameters.set('page',2);
                //console.log(gg,'gggggg')
                window.history.pushState('hospital', 'hospital', '/hospital/dpc-analysis'+urls);
                props.patientDetails(data)
              }}>
                <Article />
              </IconButton>
              }

              {props.basic != 1 &&    
              <IconButton color="secondary"  size="small"  aria-label="add an alarm"  onClick={() => {
                localStorage.setItem("ld", data.id)
                  
                window.open(window.location.href,'_blank');
               // props.patientDetails(data)
              }}>
                <OpenInNew />
              </IconButton>
              }     

              {((data.s_dpc_6 != data.dpc_6 && data.s_dpc_6 != null) || (data.s_and_1 != data.and_1 && data.s_and_1 != null) || (data.s_age_1 != data.age_1 && data.s_age_1 != null) || (data.s_sur_2 != data.sur_2 && data.s_sur_2 != null) || (data.s_tre1_1 != data.tre1_1 && data.s_tre1_1 != null) || (data.s_tre2_1 != data.tre2_1 && data.s_tre2_1 != null) || (data.s_sec_1 != data.sec_1 && data.s_sec_1 != null) || (data.s_sco_1 != data.sco_1 && data.s_sco_1 != null)) ?
                <IconButton color="secondary" aria-label="add an alarm" size="small" onClick={() => {
                  if (judge == 1) {
                    setJudge(0)
                  } else {
                    setJudge(1)
                  }
                }}>
                  <CorporateFare />
                </IconButton>        
                :
                <IconButton color="secondary" disabled={true} aria-label="add an alarm" size="small" ><CorporateFare /> </IconButton>        
              }



            </div>
            </td>
        </tr>




        <tr>
            <th colSpan={2} style={data.s_dpc_6 ? {color : 'red'}:{color : ''}}>{data.s_dpc_6? data.s_dpc_6 : data.dpc_6 }
                  {edit==1 &&  <DPCEditModal data={{val:data.s_dpc_6? data.s_dpc_6 : data.dpc_6,id:data.id, options:['999999']}}  api={''}  complete={UpdateComplete}/>}
            </th>
            <th colSpan={1} style={data.s_and_1 ? {color : 'red'}:{color : ''}}    className={`  ${yesCanbe(data.s_sur_2? data.s_sur_2 : data.sur_2, data?.dpc_disease_classi?.codes,'and_1',data.s_and_1? data.s_and_1 : data.and_1) ==false ? 'red-border' : ''}`} >
              <div className=" ">
                {data.s_and_1? data.s_and_1 : data.and_1 }
                {edit==1 &&  data?.dpc_disease_classi?.and_1?.split(",").length>0 &&  data?.dpc_disease_classi?.and_1 !='x' && 
                    <DPCEditModal data={{val:data.s_and_1? data.s_and_1 : data.and_1,id:data.id, key:'and_1', options:data?.dpc_disease_classi?.and_1?.split(",") || [], codes:data?.dpc_disease_classi?.codes }}  api={''}  complete={UpdateComplete}/>
                }                
              </div>
            </th>
            <th style={data.s_age_1 ? {color : 'red'}:{color : ''}}     className={`  ${yesCanbe(data.s_sur_2? data.s_sur_2 : data.sur_2, data?.dpc_disease_classi?.codes,'age_1',data.s_age_1? data.s_age_1 : data.age_1) ==false ? 'red-border' : ''}`}  >
                {data.s_age_1? data.s_age_1 : data.age_1 }
                {edit==1 &&   data?.dpc_disease_classi?.age_1?.split(",").length>0 &&  data?.dpc_disease_classi?.age_1 !='x' && 
                 <DPCEditModal data={{val:data.s_age_1? data.s_age_1 : data.age_1,id:data.id, key:'age_1', options:data?.dpc_disease_classi?.age_1?.split(",") || [], codes:data?.dpc_disease_classi?.codes, depend_code:data.s_sur_2? data.s_sur_2 : data.sur_2, name:'age_1' }}  api={''}  complete={UpdateComplete}/>}           
           </th>
            <th style={data.s_sur_2 ? {color : 'red'}:{color : ''}}     className={`  ${validSurgery(data.s_sur_2? data.s_sur_2 : data.sur_2, data?.dpc_disease_classi?.codes) ==false ? 'red-border' : ''}`}  >{data.s_sur_2? data.s_sur_2 : data.sur_2 }
            {edit==1 &&   data?.dpc_disease_classi?.sur_2?.split(",").length>0 &&  data?.dpc_disease_classi?.sur_2 !='x' && 
            <DPCEditModal data={{val:data.s_sur_2? data.s_sur_2 : data.sur_2,id:data.id, key:'sur_2', options:data?.dpc_disease_classi?.sur_2?.split(",") || [], codes:data?.dpc_disease_classi?.codes, depend_code:data.s_sur_2? data.s_sur_2 : data.sur_2, name:'sur_2' }}  api={''}  complete={UpdateComplete}/>}
            </th>
            <th  style={data.s_tre1_1 ? {color : 'red'}:{color : ''}}    className={`  ${yesCanbe(data.s_sur_2? data.s_sur_2 : data.sur_2, data?.dpc_disease_classi?.codes,'tre1_1',data.s_tre1_1? data.s_tre1_1 : data.tre1_1) ==false ? 'red-border' : ''}`} >{data.s_tre1_1? data.s_tre1_1 : data.tre1_1 }
            {edit==1 &&   data?.dpc_disease_classi?.tre1_1?.split(",").length>0 &&  data?.dpc_disease_classi?.tre1_1 !='x' && 
            <DPCEditModal data={{val:data.s_tre1_1? data.s_tre1_1 : data.tre1_1,id:data.id, key:'tre1_1', options:data?.dpc_disease_classi?.tre1_1?.split(",") || [], codes:data?.dpc_disease_classi?.codes, depend_code:data.s_sur_2? data.s_sur_2 : data.sur_2, name:'tre1_1' }}  api={''}  complete={UpdateComplete}/>}
            </th>
            <th  style={data.s_tre2_1 ? {color : 'red'}:{color : ''}}   className={`  ${yesCanbe(data.s_sur_2? data.s_sur_2 : data.sur_2, data?.dpc_disease_classi?.codes,'tre2_1',data.s_tre2_1? data.s_tre2_1 : data.tre2_1) ==false ? 'red-border' : ''}`}  >{data.s_tre2_1? data.s_tre2_1 : data.tre2_1 }            
            {edit==1 &&   data?.dpc_disease_classi?.tre2_1?.split(",").length>0 &&  data?.dpc_disease_classi?.tre2_1 !='x' && 
            <DPCEditModal data={{val:data.s_tre2_1? data.s_tre2_1 : data.tre2_1,id:data.id, key:'tre2_1', options:data?.dpc_disease_classi?.tre2_1?.split(",") || [], codes:data?.dpc_disease_classi?.codes, depend_code:data.s_sur_2? data.s_sur_2 : data.sur_2, name:'tre2_1' }}  api={''}  complete={UpdateComplete}/>}
            </th>

            <th style={data.s_sec_1 ? {color : 'red'}:{color : ''}}   className={`  ${yesCanbe(data.s_sur_2? data.s_sur_2 : data.sur_2, data?.dpc_disease_classi?.codes,'sec_1',data.s_sec_1? data.s_sec_1 : data.sec_1) ==false ? 'red-border' : ''}`} >{data.s_sec_1? data.s_sec_1 : data.sec_1 }
            {edit==1 &&   data?.dpc_disease_classi?.sec_1?.split(",").length>0 &&  data?.dpc_disease_classi?.sec_1 !='x' && 
            <DPCEditModal data={{val:data.s_sec_1? data.s_sec_1 : data.sec_1,id:data.id, key:'sec_1', options:data?.dpc_disease_classi?.sec_1?.split(",") || [], codes:data?.dpc_disease_classi?.codes, depend_code:data.s_sur_2? data.s_sur_2 : data.sur_2, name:'sec_1' }}  api={''}  complete={UpdateComplete}/>}
            </th>
            
            <th  style={data.s_sco_1 ? {color : 'red'}:{color : ''}}   className={`  ${yesCanbe(data.s_sur_2? data.s_sur_2 : data.sur_2, data?.dpc_disease_classi?.codes,'sco_1',data.s_sco_1? data.s_sco_1 : data.sco_1) ==false ? 'red-border' : ''}`} >{data.s_sco_1? data.s_sco_1 : data.sco_1 }
            {edit==1 &&   data?.dpc_disease_classi?.sco_1?.split(",").length>0 &&  data?.dpc_disease_classi?.sco_1 !='x' && 
            <DPCEditModal data={{val:data.s_sco_1? data.s_sco_1 : data.sco_1,id:data.id, key:'sco_1', options:data?.dpc_disease_classi?.sco_1?.split(",") || [], codes:data?.dpc_disease_classi?.codes, depend_code:data.s_sur_2? data.s_sur_2 : data.sur_2, name:'sco_1' }}  api={''}  complete={UpdateComplete}/>}
            </th>
           
        </tr>

{judge==1 &&

<tr>
<th className='new_t_color_head' style={{border:'0px'}}>システム
</th>
<th colSpan={2}>{data.dpc_6 }
</th>
<th colSpan={1}>
    {data.and_1 }
</th>
<th>
    {data.age_1 }
</th>
<th>{data.sur_2 }
</th>
<th>{data.tre1_1 }
</th>
<th>{data.tre2_1 }            
</th>

<th>{data.sec_1 }
</th>

<th>{data.sco_1 }
</th>
<th className="b0">
</th>
</tr>
}

       
    </table>
   );
}
 