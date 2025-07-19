
  
import moment from 'moment';  



 
export const currentTimeValue = () => {
    try {   

      let options = {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      },
      
       myDate = new Intl.DateTimeFormat([], options);
      let pro_date=myDate.format(new Date())

      const date = new Date(pro_date);
      const timestamp = date.getTime();
      const unixTimestamp = Math.floor(date.getTime() / 1000);
      


        return unixTimestamp
      
       }catch(error){
         // next(error)
       }
  };
  

  export const currentTimeValuedate = () => {
    try {   

      let options = {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      },
      
       myDate = new Intl.DateTimeFormat([], options);
      let pro_date=myDate.format(new Date()).toString()
     
      let t1=pro_date.split(",")
      let t1_d=t1[0].split("/")
                         
           
      var year    = t1_d[2]  
      var month   = t1_d[0]  
      var day     = t1_d[1] 
          
      console.log(pro_date,year,month,day);


      const date = new Date(month+'/'+day+'/'+year+', 12:00:00 AM');
      const timestamp = date.getTime();
      const unixTimestamp = Math.floor(date.getTime() / 1000);
          
      return unixTimestamp
      
       }catch(error){
         // next(error)
       }
  };



  export const strtotime = (value) => {
    try {   
          var ts = Date.parse(value);
          const unixTimestamp = Math.floor(ts / 1000);
          return unixTimestamp 
       }catch(error){
         // next(error)
       }
  };




  export const createdAt = () => {
    try {   

      let options = {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      },
      myDate = new Intl.DateTimeFormat([], options);
    let pro_date=myDate.format(new Date()).toString()
     
     let t1=pro_date.split(",")
     let t1_d=t1[0].split("/")
     let t1_t=t1[1].split(" ")
      
     let t1_t_1=t1_t[1].split(":")
     
     
       //console.log(t1_t[2], t1_t[1], t1_t_1[0] );  
         
        
           
            var year    = t1_d[2]  
            var month   = t1_d[0]  
            var day     = t1_d[1] 
            
           // console.log(pro_date,year,month,day);
            var hour
            if(t1_t[2]=="PM"){
            let hour_0
            if(parseInt(t1_t_1[0]) == 12){
              hour_0    =  parseInt(t1_t_1[0]) 
            }else{
              hour_0    =  parseInt(t1_t_1[0])+12
            }
                  hour=hour_0.toString()
            }else{
                  hour    =  t1_t_1[0]
            if(hour=="12"){
              hour="00"
            }
            }
            
            var minute  =  t1_t_1[1]
            var second  =  t1_t_1[2]
            
            
             if(month.toString().length == 1) {
                 month = '0'+month;
            }
            if(day.toString().length == 1) {
                 day = '0'+day;
            }   
            if(hour.toString().length == 1) {
                 hour = '0'+hour;
            }
            if(minute.toString().length == 1) {
                 minute = '0'+minute;
            }
            if(second.toString().length == 1) {
                 second = '0'+second;
            }
         var dateTime = new Date(year+'-'+month+'-'+day+'T'+hour+':'+minute+':'+second+'.000Z');
      return dateTime;
       }catch(error){
         // next(error)
       }
  };
  
  

  export const timeBeauty = (time) => {
    if (!time) {
      return ''
    } 
    const date = new Date(time);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return formattedDate;
  }


    export const  formatJapaneseDate=(isoTimestamp) =>{
     const m = moment(isoTimestamp).subtract(6, 'hours');
    return m.format('YYYY年M月D日 H時mm分ss秒');
  }

  export function daysUntil(targetDate) {
    // Get today's date and set time to midnight for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse the target date
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    // Calculate difference in milliseconds
    const diffInMs = target - today;
    
    // Convert milliseconds to days
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    return diffInDays;
}
 