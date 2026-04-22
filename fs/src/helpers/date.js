const getCurrentTime = () => {
    return new Date().toLocaleDateString('en-NP', {
       month: "short",   
  day: "2-digit",   
  year: "numeric",  
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true
    }).split(",")
}

export {getCurrentTime} 