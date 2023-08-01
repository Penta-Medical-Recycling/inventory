import CardLister from '../Components/CardLister'

function Home() {

  return (
    <>
      <div id='text-section'>
        <h1 className='is-size-2 has-text-weight-bold has-text-centered' id='penta-title'>Penta Prosthetics Current Inventory</h1>
        <p className='my-6 mx-6 is-size-5 has-text-centered' style={{ width: '60%' }}>To submit a request, please click the “add to cart” button on the items card and visit the cart above. Then choose the partner you are and click request items.</p>
        <div id="search-form">
          <form>
            <div className="field">
              <div className="control has-icons-left">
                <input className="input" type="text" placeholder="Search by description, size, or model/type" style={{width:'80vw'}}></input>
                <span className="icon is-small is-left">
                  <i className="fas fa-search"></i>
                </span>
              </div>
            </div>
          </form>
          <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512" id='download-button'><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" /></svg>
        </div>
        <p className='my-6'>If you would like to download a copy of the current page click the icon to the right of the search bar.</p>
      </div>
      <CardLister />
    </>
  )
}

export default Home