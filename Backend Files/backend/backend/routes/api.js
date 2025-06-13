const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

router.post('/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).send(activity);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/activities/batch', async (req, res) => {
  try {
    const activities = await Activity.insertMany(req.body.activities);
    res.status(201).send(activities);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/users/:userId/report/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const activities = await Activity.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.params.userId),
          timestamp: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$timestamp" },
            productive: "$productive"
          },
          totalDuration: { $sum: "$duration" }
        }
      },
      {
        $group: {
          _id: "$_id.day",
          productiveTime: {
            $sum: {
              $cond: [{ $eq: ["$_id.productive", true] }, "$totalDuration", 0]
            }
          },
          unproductiveTime: {
            $sum: {
              $cond: [{ $eq: ["$_id.productive", false] }, "$totalDuration", 0]
            }
          }
        }
      },
      {
        $project: {
          day: "$_id",
          productiveTime: 1,
          unproductiveTime: 1,
          _id: 0
        }
      },
      { $sort: { day: 1 } }
    ]);

    res.send(activities);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/users/:userId/insights', async (req, res) => {
  try {
    const insights = await Activity.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.params.userId)
        }
      },
      {
        $group: {
          _id: "$productive",
          totalDuration: { $sum: "$duration" },
          domains: {
            $push: {
              domain: "$domain",
              duration: "$duration"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          productive: "$_id",
          totalDuration: 1,
          domains: 1
        }
      }
    ]);

    const productiveDomains = insights.find(i => i.productive)?.domains || [];
    const unproductiveDomains = insights.find(i => !i.productive)?.domains || [];

    const topProductive = productiveDomains
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    const topUnproductive = unproductiveDomains
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    res.send({
      topProductive,
      topUnproductive,
      totalProductive: productiveDomains.reduce((sum, d) => sum + d.duration, 0),
      totalUnproductive: unproductiveDomains.reduce((sum, d) => sum + d.duration, 0)
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
