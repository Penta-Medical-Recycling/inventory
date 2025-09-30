//Imported all the parts of the prosthetic leg as SVG files
import abundmentScrew from'../assets/selectedLegGraphic/abundmentScrew.svg';
import theSocket from'../assets/selectedLegGraphic/theSocket.svg';
import theKnee from'../assets/selectedLegGraphic/theKnee.svg';
import theCalf from'../assets/selectedLegGraphic/theCalf.svg';
import thePylon from'../assets/selectedLegGraphic/thePylon.svg';
import theAnkle from'../assets/selectedLegGraphic/theAnkle.svg';
import theFoot from'../assets/selectedLegGraphic/theFoot.svg';

/* 
- Div is set to relative positioning to allow absolute positioning of child elements.
- Each part of the prosthetic leg is absolutely positioned within the container div.
- Width and height of each part is set to ensure proper scaling and visibility */

const ProstheticLegGraphic = () => {
  return (
     <div className="relative w-[1400px] h-[1400px] bg-transparent"> {/* Container for the prosthetic leg graphic */}
      <img src={abundmentScrew} alt="Abutment Screw" className="absolute left-[862px] top-[888px] w-[58px] h-[99px]" /> {/* Abutment Screw */}
      <img src={theSocket} alt="Socket" className="absolute left-[887px] top-[984px] w-[50px] h-[102px]" /> {/* Socket */}
      <img src={theKnee} alt="Knee" className="absolute left-[900px] top-[1090px] w-[23px] h-[12px]" />{/* Knee */}
      <img src={theCalf} alt="Calf" className="absolute left-[895px] top-[1106px] w-[33px] h-[64px]" />{/* Calf */}
      <img src={thePylon} alt="Pylon" className="absolute left-[907px] top-[1169px] w-[11px] h-[51px]" />{/* Pylon */}
      <img src={theAnkle} alt="Ankle" className="absolute left-[905px] top-[1220px] w-[12px] h-[13px]" />{/* Ankle */}
      <img src={theFoot} alt="Foot" className="absolute left-[872px] top-[1235px] w-[52px] h-[28px]" />{/* Foot */}
    </div>
  );
};

//Exporting the ProstheticLegGraphic component
export default ProstheticLegGraphic;