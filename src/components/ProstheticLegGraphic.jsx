import abundmentScrew from'../assets/selectedLegGraphic/abundmentScrew.svg';
import theSocket from'../assets/selectedLegGraphic/theSocket.svg';
import theKnee from'../assets/selectedLegGraphic/theKnee.svg';
import theCalf from'../assets/selectedLegGraphic/theCalf.svg';
import thePylon from'../assets/selectedLegGraphic/thePylon.svg';
import theAnkle from'../assets/selectedLegGraphic/theAnkle.svg';
import theFoot from'../assets/selectedLegGraphic/theFoot.svg';

const ProstheticLegGraphic = () => {
  return (
     <div className="w-[1400px] h-[1400px] bg-transparent">
      <img src={abundmentScrew} alt="Abutment Screw" className="absolute left-[862px] top-[888px] w-[58px] h-[99px]" />
      <img src={theSocket} alt="Socket" className="absolute left-[887px] top-[984px] w-[50px] h-[102px]" />
      <img src={theKnee} alt="Knee" className="absolute left-[899px] top-[1090px] w-[23px] h-[12px]" />
      <img src={theCalf} alt="Calf" className="absolute left-[895px] top-[1106px] w-[33px] h-[64px]" />
      <img src={thePylon} alt="Pylon" className="absolute left-[907px] top-[1174px] w-[11px] h-[51px]" />
      <img src={theAnkle} alt="Ankle" className="absolute left-[905px] top-[1229px] w-[12px] h-[13px]" />
      <img src={theFoot} alt="Foot" className="absolute left-[872px] top-[1253px] w-[52px] h-[28px]" />
    </div>
  );
};

export default ProstheticLegGraphic;