import { useContext } from "react";
import logo from '../../assets/Penta.png'
import PentaContext from "../../context/PentaContext";

const BulkOrderAnnouncement = () => (
    <div className="bulk-announcement">
        <h2>Bulk ordering has a new workflow</h2>
        <ol className="bulk-announcement__steps">
            <li><span>Open an item group.</span></li>
            <li><span>Select <strong>Bulk add</strong> above the inventory list.</span></li>
            <li><span>Choose a size when prompted, then select the quantity you need.</span></li>
        </ol>
        <p className="bulk-announcement__note">
            <strong>Before you begin:</strong> Please allow a few moments for inventory availability to load.
        </p>
    </div>
);

// eslint-disable-next-line react/prop-types
const PopUpCard = ({ showModal, setShowModal }) => {
    const { message } = useContext(PentaContext)
    const isBulkOrderAnnouncement = /bulk order/i.test(message);

    return (
        <>
            <div className= {showModal ? "modal is-active" : "modal"}>
                <div className="modal-background" onClick={() => setShowModal(false)}></div>
                <div
                    className="modal-card popup-card has-text-centered"
                >
                    <header
                        className="has-background-light"
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem 1.25rem",
                            borderBottom: "1px solid #dbdbdb",
                        }}
                    >
                        <p className="modal-card-title" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, color: "#363636" }}>Please note</p>
                        <button
                            className="delete is-medium"
                            aria-label="close"
                            onClick={() => setShowModal(false)}
                            style={{ position: "absolute", right: "1.25rem", backgroundColor: "#c4c4c4", borderRadius: "9999px" }}
                        ></button>
                    </header>
                    <div className="popup-card__body">
                        <div
                            className="popup-card__image has-background-white"
                        >
                            <img
                                src={logo}
                                alt="Penta Medical Recycling"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                        <div
                            className="popup-card__message has-background-light"
                        >
                            <article>
                                {isBulkOrderAnnouncement ? <BulkOrderAnnouncement /> : message}
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PopUpCard;
