import Image from "./Image";
const OutOfStockCard = ({item, setButton, setCartCount, cartCount, setIsCartPressed, button, setOutOfStock}) => {
    return (
        <div className={`card visible`} key={item.id}>
            <div className="ribbon-wrapper">
                <div className="ribbon ribbon-top-left"><span>Out Of Stock</span></div>
                <header className="card-header">
                    <div className="has-text-right mr-5" style={{ width: "50%", marginLeft:'auto' }}>
                        <p className="has-text-weight-bold my-3" style={{ fontSize: "18px" }}>
                            {item["Description (from SKU)"]}
                        </p>
                        <p style={{ marginTop: "-12px" }} className="has-text-grey ml-3 mb-3">
                            {item["Item ID"]}
                        </p>
                    </div>
                </header>
                <div className="">
                    <p className="has-text-weight-bold has-text-centered mt-4" style={{ fontSize: "18px" }}>
                        {item["Tag"]}
                    </p>
                    <hr className="mb-4 mt-3" style={{ margin: "0 auto", width: "80%" }}></hr>
                </div>
                <div className="content mx-5 mb-5">
                    {item["Manufacturer"] && (
                        <div className="mb-4 has-text-centered" style={{ width: "50%" }}>
                            <p className="has-text-weight-bold" style={{ margin: "0" }}>
                                Manufacturer
                            </p>
                            <p>{item["Manufacturer"]}</p>
                        </div>
                    )}
                    {item["Size"] && (
                        <div className="has-text-centered" style={{ width: "50%" }}>
                            <p className="has-text-weight-bold has-text-centered" style={{ margin: "0" }}>
                                Size
                            </p>
                            <p>{item["Size"]}</p>
                        </div>
                    )}
                    {item["Model/Type"] && (
                        <div className="has-text-centered" style={{ width: "50%" }}>
                            <p className="has-text-weight-bold has-text-centered" style={{ margin: "0" }}>
                                Model
                            </p>
                            <p>{item["Model/Type"]}</p>
                        </div>
                    )}
                </div>
            </div>
            <footer className="card-footer">
                {/* <a
                    className={`button card-footer-item ${!localStorage.getItem(item["Item ID"]) ? "images-button-red" : "images-button-blue"}`}
                    href={`https://www.google.com/search?q=${encodeURIComponent(item.StringSearch)}&tbm=isch`}
                    target="_blank"
                >
                    <Image color={"white"}></Image>
                </a> */}
                <button
                    className="button card-footer-item remove-button out-btn"
                    style={{
                        color: "white",
                        
                    }}
                    onClick={() => {
                        // setOutOfStock(new Set())
                        localStorage.removeItem(item["Item ID"]);
                        setButton(button + 1);
                        setCartCount(cartCount - 1);
                        setIsCartPressed(true);
                        setTimeout(() => {
                            setIsCartPressed(false);
                        }, 1000);
                        
                    }}
                >
                    REMOVE FROM CART
                </button>

            </footer>
        </div>
    )
}

export default OutOfStockCard
