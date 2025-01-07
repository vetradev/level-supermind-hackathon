const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.langflow.astra.datastax.com/lf/b7acdf39-0fb3-4e71-852b-8088b917f998/api/v1/run/4fe89de7-a27f-41fd-83fd-ee3104a90c09?stream=false",
      req.body,
      {
        headers: {
          'Authorization': 'Bearer AstraCS:uzXqruZtMSLfCjlXPnDaGFqj:9f7623b13ea55edcbbfbfda9286733d83b3dfc7f717022a68f3c967fa95c5d28',
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));