import Talentlogo from "../../imgs/talent boozt.png";

const Footer = () => {
  return (
    <div className="bg-[#f5f5f5] w-screen h-[120px] flex items-center justify-end px-10 border-t-[1px] border-[#acacac] z-1">
      <span className="text-sm text-[#666666] ">
        Powered by Talent Boozt
      </span>
      <img src={Talentlogo} alt="Company-logo" className="ms-2"/>
    </div>
  );
};

export default Footer;
