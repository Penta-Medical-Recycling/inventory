import React, { useState, useEffect } from 'react';

const CardLister = () => {
  const [data, setData] = useState([]);
  const apiKey = 'keyi3gjKvW7SaqhE4';
  const baseId = 'appLiJPf3Iykl3Yui';
  const tableName = 'Imported table';

  // Encode the table name to make it URL-safe
  const encodedTableName = encodeURIComponent(tableName);

  const url = `https://api.airtable.com/v0/${baseId}/${encodedTableName}`;

  async function fetchData() {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  useEffect(() => {
    fetchData().then((records) => {
      setData(records);
      console.log(records)
    });
  }, []);

  return (
    <div id='cardDiv'>
      {data.map((item) => (
        <div className="card" key={item.id}>
          <div className="card-content">
            <div className="content">
              <p>ID: {item.fields['Item ID']}</p>
              <p>Name: {item.fields['Description (from SKU)']}</p>
              {item.fields['Size']? <p>Size: {item.fields['Size']}</p>: <></>}
              {item.fields['Model/Type']? <p>Model: {item.fields['Model/Type']}</p>: <></>}
              {item.fields['Manufacturer']? <p>Manufacturer: {item.fields['Manufacturer']}</p>: <></>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardLister;
