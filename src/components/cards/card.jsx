import { Container } from "postcss";
import React from "react";
// prop: imgs text


// TODO:
// - This component will represent the individual card with the prosthetic's name and image source
// - Style the individual card
// - Import this component into the grid.jsx component by first exporting it from this file



export default function Card({partName,imgSrc, }) {
  // const props = [

  //   { id: 1, partName: "Double Adapters - Male", img: "https://drive.google.com/thumbnail?id=1HI-BP4exGIb7sADpZ-FQS2QFx_bzC3YV" },
  //   // { id: 2, partName: "Double Adapter - Female", img: "https://drive.google.com/thumbnail?id=1A07AHZskJ80j8SyHgdA02jm3Ro21n6p4" },
  //   // { id: 3, partName: "Double Adapters - Male", img: "./src/public/image.png" },
  //   // { id: 4, partName: "Double Adapter - Female", img: "./src/public/image.png" },
  //   // { id: 5, partName: "Double Adapter2 - Female", img: "./src/public/image.png" },
  //   // { id: 6, partName: "Double Adapter4 - Female", img: "./src/public/image.png" },

  // ];


  
  return (
// whole screen Container
    <div  >
      {/* Card */}
          <div className=" w-full h-[349px] bg-white border-2 border-red-500 rounded-xl shadow-lg p-6 flex flex-col items-center">


            {/* img div in div put tailwind code */}
            <div className="mb-3 flex-1 flex items-center justify-center max-h-[200px] object-contain overflow-hidden" >
              <img
              className=" w-[100px] h-[100px] object-contain"
               src={imgSrc}
                alt={partName}
              />
            </div>


            {/* part name div in div put tailwind code*/}
            <div className="text-black text-lg font-medium text-center mt-4 ">
              {partName}
            </div>
          </div>
      </div>
    
  );
}




