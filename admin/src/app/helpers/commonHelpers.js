export const filterItemsEqual = (arr, field, value) => { try { if (field != null) { return arr.filter((item) => { return item[field]==value }) }} catch (error) { console.error(error);}}

export const excelSerialNumberToJSDate = (serial) => {

  if(serial){

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

  }else{
    return  null;
  }
  };