import express from 'express';
const router = express.Router();

const services = [
  { _id: "clinic", name: "Clinic" },
  { _id: "bursary", name: "Bursary" },
  { _id: "cafeteria", name: "Cafeteria" }
];

router.get('/', (req, res) => res.json(services));

export default router;
