const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Atlas 연결
const dbUri = process.env.DB_URI;

mongoose
  .connect(dbUri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// 꽃 상세정보 스키마
const flowerSchema = new mongoose.Schema(
  {
    flowername: String,
    flowername_kr: String,
    habitat: String,
    classification: String,
    flowerlang: String,
    bloom: String,
  },
  {
    collection: "flowers",
  }
);

const Flower = mongoose.model("Flower", flowerSchema);

// 기본 테스트 주소
app.get("/", (req, res) => {
  res.send("FDY Backend Server is running");
});

// 꽃 상세정보 조회
app.get("/flowers", async (req, res) => {
  try {
    const flowername = req.query.flowername;

    if (!flowername) {
      return res.status(400).json({ error: "flowername query is required" });
    }

    const flower = await Flower.findOne({
      flowername: { $regex: new RegExp(flowername, "i") },
    });

    if (!flower) {
      return res.status(404).json({ error: "Flower not found" });
    }

    res.json(flower);
  } catch (error) {
    console.error("Error fetching flower:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// 네이버 쇼핑 검색
app.get("/naver-shopping", async (req, res) => {
  try {
    const flowername = req.query.flowername;

    if (!flowername) {
      return res.status(400).json({ error: "flowername query is required" });
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const apiUrl = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(
      flowername
    )}&display=10&start=1&sort=sim`;

    const response = await axios.get(apiUrl, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Naver Shopping API error:", error.message);
    res.status(500).json({ error: "Naver Shopping API error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});