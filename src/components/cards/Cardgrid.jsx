// TODO:
// - Take the grid styling that's currently in CardComponent and apply it here
// - In CardCompent, build the individual card with data brought in using the dummy data array
// - Import the individual card component into this file
//     - Test intide of grid.jsx with at least two cards with two pieces of dummy
import { Container } from "postcss";
import React from "react";
import Card from "./Card";


export default function CardGrid() {
    const data = [

        { id: 1, partName:"Double Adapters - Male", imgSrc:"https://drive.google.com/thumbnail?id=1HI-BP4exGIb7sADpZ-FQS2QFx_bzC3YV"},
        { id: 2, partName: "Double Adapter - Female", imgSrc: "https://drive.google.com/thumbnail?id=1A07AHZskJ80j8SyHgdA02jm3Ro21n6p4" },
        { id: 3, partName: "Double Adapters - Male", imgSrc: "./src/public/image.png"  },
        { id: 4, partName: "Double Adapter - Female", imgSrc: "./src/public/image.png" },
        { id: 5, partName: "Double Adapter2 - Female", imgSrc: "./src/public/image.png" },
        { id: 6, partName: "Double Adapter4 - Female", imgSrc: "./src/public/image.png" },
        { id: 7, partName: "Double Adapter5 - Female", imgSrc: "./src/public/image.png" },

    ];

    /*
    
        return (
            <>
                // partName might be "Double Adapters", while imgSrc is "https://drive.google.com/thumbnail?id=1HI-BP4exGIb7sADpZ-FQS2QFx_bzC3YV"
                <CardComponent name={prop.partName} imgSrc={prpps.imgSrc/>
                <CardComponent name={prop.partName} imgSrc={prpps.imgSrc/>
            </>
        
        )
    */


       
    return (
       
            <div className="bg-gray-500 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-center gap-6 p-10">
                {data.map((card, index) => (

              
                    <Card key={card.id}
                        partName={card.partName} imgSrc={card.imgSrc}/>
                ))}
            </div>
        
    )
}