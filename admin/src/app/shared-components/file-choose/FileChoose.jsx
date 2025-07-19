import { Icon, IconButton} from "@mui/material";
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';
import TextField from '@mui/material/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as XLSX from "xlsx";
import { useEffect, useRef, useState } from 'react';
import '../../../styles/custom-basic.css';
import i18next from 'i18next';
import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import * as React from 'react';
import axios from 'axios';
import apiConfig from '../../configs/apiConfig';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import en from '../i18n/en';
import ja from '../i18n/ja';
import Box from '@mui/material/Box';
 
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';			
import Papa from 'papaparse';
import { FileUploader } from "react-drag-drop-files";
import  './style.css';
 

i18next.addResourceBundle('en', 'shared-components', en);
i18next.addResourceBundle('ja', 'shared-components', ja);

const defaultValues = { name: '', email: '', subject: '', message: '' };
const schema = z.object({
	name: z.string().nonempty('You must enter a name'),
	subject: z.string().nonempty('You must enter a subject'),
	message: z.string().nonempty('You must enter a message'),
	email: z.string().email('You must enter a valid email').nonempty('You must enter an email')
});

/**
 * The help center support.
 */
function FileChoose(props) {

 // const fileInputRef = useRef(null);

	const { control, handleSubmit, watch, formState } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});
	const { isValid, dirtyFields, errors } = formState;
	const form = watch();

	function onSubmit(data) {
		// eslint-disable-next-line no-console
		console.log(data);
	}

	if (_.isEmpty(form)) {
		return null;
	}

 
    const { t } = useTranslation('shared-components');

    const [fName, setFName] = useState("");
    const [message, setMessage] = useState("none");

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [progress, setProgress] = React.useState(10);

    const [line1, setLine1] = React.useState(null);
    const [line2, setLine2] = React.useState(null);
    const [sheetlist, setsheetlist] = React.useState([]);
    const [selectedSheet, setselectedSheet] = React.useState(null);

    const fileTypes = ["xls", "xlsx", "csv"];
    
    useEffect(() => {  setProgress(props.progress)  }, [props.progress]);
    useEffect(() => {   setData([])  }, [props.resetComponents]);
    

    function LinearProgressWithLabel(props) {
      return (<Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props}/>
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>);
    }

 


  /*const readUploadFile = (e) => {
    e.preventDefault();    
    try {
      setLoading(true)
      if (e.target.files) {
        const reader = new FileReader();

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();

        reader.onload = (e) => {
          let json = []


          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetList = workbook.SheetNames;

          let sheetName = null
          if (selectedSheet == null) {
            sheetName = workbook.SheetNames[0];
          } else {
            sheetName = selectedSheet;
          }

          let text = sheetName;

          if (sheetList?.length > 1) {


            let person = prompt("Select sheetname:", sheetName);
            if (person == null || person == "") {

             } else {
              if(sheetList.includes(person)){
                      text = person;
              }
            } 
          }


          setsheetlist(sheetList)

          const worksheet = workbook.Sheets[text];
          json = XLSX.utils.sheet_to_json(worksheet);
          console.log(json, '777')
          setLoading(false)
          setMessage(Object.keys(json).length + " " + t("items found!") || "none")
          setData(json)
          fileInputRef.current.value = '';
          //}


          try {
            setLine1(JSON.stringify(json[0]))


            const arr = [];
            const arr_all = [];
            const arr_all_value = [];
            const arr_used = [];

            let json1 = json[1]
            let json1_str = ""
            let t_keyConfig = props.keyConfig

            for (let z in json1) {
              arr_all.push(z);
              arr_all_value.push(json1[z]);
              let this_str = ""
              for (let h = 0; h < t_keyConfig.length; h++) {
                let keycon = t_keyConfig[h]

                const keyconSplit = keycon.xlsx.split("<+>");
                for (let x = 0; x < keyconSplit.length; x++) {

                  if (keyconSplit[x] != '<auto>') {
                    if (keyconSplit[x] == z) {
                      this_str = '<span style="border-radius: 5px;  padding: 5px; line-height: 40px; border:1px solid gray; margin-right:7px; margin-bottom:5px; padding-right:3px; padding-left:3px"><span style="color:green; font-weight:bold">' + z + '</span>' + " : " + '<span style="color:blue">' + t(keycon.header) + '<span style="color:gray; font-size:10px;"> ' + json1[z] + ' </span></span></span>'
                      arr.push(z);
                    }
                  } else {

                  }
                }
              }

              json1_str = json1_str + this_str
            }


            for (let h = 0; h < t_keyConfig.length; h++) {
              let keycon = t_keyConfig[h]
              let this_str = ""
              const keyconSplit = keycon.xlsx.split("<+>");
              for (let x = 0; x < keyconSplit.length; x++) {
                console.log(keyconSplit[x], 'check')
                if (arr.includes(keyconSplit[x]) == true) {
                } else {
                  if (keyconSplit[x] != '<auto>') {
                    this_str = '<span style="border-radius: 5px;  padding: 5px; line-height: 40px; border:1px solid red; margin-right:7px;  margin-bottom:5px; padding-right:3px; padding-left:3px"><span style="color:green; font-weight:bold">' + keyconSplit[x] + '</span>' + " : " + '<span style="color:red">' + t('Not Found') + '</span></span>'
                  }
                }
              }
              json1_str = json1_str + this_str
            }



            for (let h = 0; h < arr_all.length; h++) {
              let ttt = arr_all[h]
              let this_str = ""
              if (arr.includes(ttt) == true) {

              } else {
                this_str = '<span style="border-radius: 5px;  padding: 5px; line-height: 40px; border:1px solid red; margin-right:7px;  margin-bottom:5px; padding-right:3px; padding-left:3px"><span style="color:green; font-weight:bold">' + ttt + '</span>' + " : " + '<span style="color:orange">' + t('Not Used') + '</span><span style="color:gray; font-size:10px;"> ' + arr_all_value[h] + ' </span></span>'
              }

              json1_str = json1_str + this_str
            }


            setLine2(json1_str)


          } catch (error) {

          }





          props.sendDataToParent(json);

        };
        reader.readAsArrayBuffer(e.target.files[0]);

      }
    }
    catch (err) {
      setMessage(t("No data found!"))
      console.log('errro', err)
      setLoading(false)
    }
  }*/


  const readUploadFileDrag = (file) => {
   // e.preventDefault();    
    try {
      setLoading(true)
      if (file) {
        const reader = new FileReader();

 
        const fileExt = file.name.split('.').pop();

        reader.onload = (evt) => {
          let json = []


          const data = evt.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetList = workbook.SheetNames;

          let sheetName = null
          if (selectedSheet == null) {
            sheetName = workbook.SheetNames[0];
          } else {
            sheetName = selectedSheet;
          }

          let text = sheetName;

          if (sheetList?.length > 1) {


            let person = prompt("Select sheetname:", sheetName);
            if (person == null || person == "") {

             } else {
              if(sheetList.includes(person)){
                      text = person;
              }
            } 
          }


          setsheetlist(sheetList)

          const worksheet = workbook.Sheets[text];
          json = XLSX.utils.sheet_to_json(worksheet);
          console.log(json, '777')
          setLoading(false)
          setMessage(Object.keys(json).length + " " + t("items found!") || "none")
          setData(json)
        //  fileInputRef.current.value = '';
          //}


          try {
            setLine1(JSON.stringify(json[0]))


            const arr = [];
            const arr_all = [];
            const arr_all_value = [];
            const arr_used = [];

            let json1 = json[1]
            let json1_str = ""
            let t_keyConfig = props.keyConfig

            for (let z in json1) {
              arr_all.push(z);
              arr_all_value.push(json1[z]);
              let this_str = ""
              for (let h = 0; h < t_keyConfig.length; h++) {
                let keycon = t_keyConfig[h]

                const keyconSplit = keycon.xlsx.split("<+>");
                for (let x = 0; x < keyconSplit.length; x++) {

                  if (keyconSplit[x] != '<auto>') {
                    if (keyconSplit[x] == z) {
                      this_str = '<span style="border-radius: 5px;  padding: 5px; line-height: 40px; border:1px solid gray; margin-right:7px; margin-bottom:5px; padding-right:3px; padding-left:3px"><span style="color:green; font-weight:bold">' + z + '</span>' + " : " + '<span style="color:blue">' + t(keycon.header) + '<span style="color:gray; font-size:10px;"> ' + json1[z] + ' </span></span></span>'
                      arr.push(z);
                    }
                  } else {

                  }
                }
              }

              json1_str = json1_str + this_str
            }


            for (let h = 0; h < t_keyConfig.length; h++) {
              let keycon = t_keyConfig[h]
              let this_str = ""
              const keyconSplit = keycon.xlsx.split("<+>");
              for (let x = 0; x < keyconSplit.length; x++) {
                console.log(keyconSplit[x], 'check')
                if (arr.includes(keyconSplit[x]) == true) {
                } else {
                  if (keyconSplit[x] != '<auto>') {
                    this_str = '<span style="border-radius: 5px;  padding: 5px; line-height: 40px; border:1px solid red; margin-right:7px;  margin-bottom:5px; padding-right:3px; padding-left:3px"><span style="color:green; font-weight:bold">' + keyconSplit[x] + '</span>' + " : " + '<span style="color:red">' + t('Not Found') + '</span></span>'
                  }
                }
              }
              json1_str = json1_str + this_str
            }



            for (let h = 0; h < arr_all.length; h++) {
              let ttt = arr_all[h]
              let this_str = ""
              if (arr.includes(ttt) == true) {

              } else {
                this_str = '<span style="border-radius: 5px;  padding: 5px; line-height: 40px; border:1px solid red; margin-right:7px;  margin-bottom:5px; padding-right:3px; padding-left:3px"><span style="color:green; font-weight:bold">' + ttt + '</span>' + " : " + '<span style="color:orange">' + t('Not Used') + '</span><span style="color:gray; font-size:10px;"> ' + arr_all_value[h] + ' </span></span>'
              }

              json1_str = json1_str + this_str
            }


            setLine2(json1_str)


          } catch (error) {
console.log(error, '#############')
          }


console.log(json,'<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>')


          props.sendDataToParent(json);

        };
        reader.readAsArrayBuffer(file);

      }
    }
    catch (err) {
      setMessage(t("No data found!"))
      console.log('errro', err)
      setLoading(false)
    }
  }

  return (
    <div className="">
      <div className="flex flex-col">




        {props.disableBack!=true &&<motion.span
          initial={{ x: 20 }}
          animate={{ x: 0, transition: { delay: 0.0 } }}
        >
          <div className="sm:mt-32">
            <Button
              onClick={() => {
                props.enableUpload(0)
              }}
              color="secondary"
              startIcon={<FuseSvgIcon>heroicons-outline:arrow-narrow-left</FuseSvgIcon>}
            >
              {t(props.textUpload)}
            </Button>
          </div>
        </motion.span>}

 

        <motion.span
          initial={{ y: -20 }}
          animate={{ y: 0, transition: { delay: 0.1 } }}
        >
          <div className="mt-32 sm:mt-48 p-24 pb-28 sm:p-40 sm:pb-28 rounded-2xl   bg-white rounded-2xl bg-slate-100">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="px-0 sm:px-24 items-center flex flex-col items-center"
            >


              <FileUploader
                multiple={false}
                handleChange={readUploadFileDrag}
                name="file"
                classes="drop_message"
                label= {' '+t('Drag and drop')+'. '}
                types={fileTypes}
              />

              <br></br>

             {/*} '+t('Or refer to a local file upload')+'  <Button disabled={loading}
                color="success" variant="contained" component="label" style={{ width: "600px", height: "400px", ...loading == true ? { opacity: ".3" } : {} }}>
                <Icon> add_to_photos </Icon>&nbsp; {t('Choose XLSX/CSV')}
                &nbsp;<input  ref={fileInputRef}  name="upload" id="upload" onChange={readUploadFile} accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" type="file" />
              </Button>*/}

              {loading == true &&
                <CircularProgress />
              }


              <Typography display={message} color="text.secondary" className=' text-center'>
                {message}
              </Typography>




              {/*<div className="mb-24 mt-24">
                <Typography color="text.secondary" className=' text-center'>
                  {t('Drag and drop')} <br />  {t('Or refer to a local file upload')}
                </Typography>
              </div>*/}

            </form>

            { progress > 0 &&
                  <LinearProgressWithLabel value={progress}/>
            }

          </div>
        </motion.span>
 





<div variant="contained" aria-label="Basic button group" className="flex flex-wrap mt-10">
{sheetlist.map((_item) => (
  <div 		onClick={() => {
    setselectedSheet(_item)
  }} className="p-4 border-2 border-red-400 cursor-pointer m-5">{_item}</div>
))}
</div>

        {line1&& props.disableBack!=true && 
            <>
              <Typography
              style={{"margin-top": "30px", "text-align":"center", "color":"gray"}}
                className="text-15 mt-30 mb-5  font-600"
                variant="h6"
              >
                {t('File Info')}

                <div dangerouslySetInnerHTML={{ __html: ' <span style="border-radius: 5px;  padding: 5px; line-height: 40px; border:1px solid gray; margin-right:7px; margin-bottom:5px; padding-right:3px; padding-left:3px"><span style="color:green; font-weight:bold">'+t('Column Name')+'</span> : <span style="color:blue">'+t('Heading')+'<span style="color:gray; font-size:10px;"> '+t('Example Value')+' </span></span></span>' }} />
               


              </Typography>

                <List>
                    <ListItem>
                        
                          <div dangerouslySetInnerHTML={{ __html: line2 }} />
                      
                    </ListItem>
                </List>
          </>
        }



      </div>








    </div>
  );
}

export default FileChoose;
