import { Container } from "postcss";
import React from "react";
import "../../App.css";

// prop: imgs text


// TODO:
// - This component will represent the individual card with the prosthetic's name and image source
// - Style the individual card
// - Import this component into the grid.jsx component by first exporting it from this file



export default function Card({partName,imgSrc, }) {
 
  
  return (
// whole screen Container
   
    
 
         
            <div className=" w-4/4 h-[349px]  border-2 border-gray-200 rounded-2xl shadow-md p-6 flex flex-col items-center justify-between hover:shadow-xl ">


            {/* img div in div put tailwind code */}
            <div className="w-[238px] h-[181px] mb-4 flex items-center justify-center  object-contain overflow-hidden" >
              <img
              className=" w-full h-full object-contain"
               src={imgSrc}
                alt={partName}
              />
            </div>


            {/* part name div in div put tailwind code*/}
            <div className="text-black text-lg font-semibold text-center mt-4 ">
              {partName}
            </div>
          </div>
       
  
    
  );
}
