const API="https://script.google.com/macros/s/AKfycbxZDBqphHY-C3nwElZ7grUq5qVHUrndzHgNUzsvUjd58JCnJ4OGmY5j2vqOCvE5kXsPTg/exec";

document.addEventListener("DOMContentLoaded",function(){

const btn=document.getElementById("drawBtn");

btn.addEventListener("click",drawPrize);

});

async function drawPrize(){

const username=document.getElementById("username").value;

const loading=document.getElementById("loading");

const result=document.getElementById("result");

const gift=document.getElementById("giftBox");

if(!username){

alert("กรุณากรอก username");

return;

}

result.innerHTML="";

loading.style.display="block";

gift.classList.remove("open");

try{

const res=await fetch(API+"?username="+encodeURIComponent(username));

const data=await res.json();

loading.style.display="none";

if(!data.success){

result.innerHTML=data.error;

return;

}

gift.classList.add("open");

setTimeout(()=>{

result.innerHTML="🎉 คุณได้รับ : "+data.prize;

},500);

}catch(err){

loading.style.display="none";

result.innerHTML="เกิดข้อผิดพลาดในการเชื่อมต่อ";

}

}
