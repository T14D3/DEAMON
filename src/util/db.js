const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'deamon',
  password: '',
  database: 'deamon_data'
});

// Function to save data
const saveData = async (data) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
    let uniqueId;
    let isUnique = false;
    const connection = await pool.getConnection();
  
    try {
      while (!isUnique) {
        uniqueId = Math.random().toString(36).substr(2, 8); // Generate an 8 character alphanumeric ID
  
        try {
          // Check if the generated ID already exists in the database
          const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM builds WHERE id = '${uniqueId}'`);
          if (rows[0].count === 0) {
            isUnique = true; // ID is unique, exit the loop
          } else {
            console.warn(`Duplicate ID generated. Retrying...`);
          }
        } catch (error) {
          console.error('Error checking unique ID:', error);
          throw error;
        }
      }
  
      // Stringify the entire `data` object and insert it into the `builds` table
      await connection.query(
        'INSERT INTO builds (id, data, timestamp) VALUES (?, ?, ?)',
        [uniqueId, JSON.stringify(data), timestamp]
      );
  
      return { success: true, id: uniqueId };
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    } finally {
      connection.release(); // Release the connection back to the pool
    }
};

// Function to load data
const loadData = async (id) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.query(`SELECT data FROM builds WHERE id = '${id}'`);
  
      if (rows.length === 0) {
        throw new Error(`No data found for id ${id}`);
      }
  
      // Extract the data from the first row (assuming id is unique)
      const data = JSON.parse(rows[0].data);
      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    } finally {
      connection.release(); // Release the connection back to the pool
    }
  };

module.exports = {
  saveData,
  loadData
};
