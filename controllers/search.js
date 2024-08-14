const mongoose = require("mongoose");
const Talent = mongoose.model("Talent");

// Function to handle the date range of the filters
function getDateRangeForUploadedFilter(uploaded) {
  const now = new Date();
  switch (uploaded) {
    case "Past-week":
      return {
        startDate: new Date(now.setDate(now.getDate() - 7)),
        endDate: new Date(),
      };
    case "Past-month":
      return {
        startDate: new Date(now.setMonth(now.getMonth() - 1)),
        endDate: new Date(),
      };
    // Add more cases as needed
    default:
      return null;
  }
}

const fetchAllTalents = async (req, res) => {
  const talents = await Talent.find({ profileCompleted: true });
  res.status(200).json(talents);
};

const fetchDynamicFilters = async (req, res) => {
  const talents = await Talent.find({ profileCompleted: true });

  if (!talents.length) return res.status(200).json(["No Data"]);

  const userLocations = talents.map((talent) => talent.location.split(",")[0]);

  const locations = [...new Set(userLocations)];

  const userSkills = talents.map((talent) => talent.skills);
  const flatSkills = userSkills.flat();
  const skills = [...new Set(flatSkills)];

  res.status(200).json({ locations, skills });
};

const fetchFilteredTalents = async (req, res) => {
  const { location, badges, shortlisted, liked, uploaded, skill } =
    req.body;

  let query = {};

  if (location) {
    query.location = new RegExp(`^${location}`, "i");
  }

  if (skill) {
    query.skills = { $regex: new RegExp(skill, "i") };
  }

  // const industryFilters = Object.keys(industry).filter((key) => industry[key]);
  // if (industryFilters.length > 0) {
  //   query.skills = { $in: industryFilters };
  // }

  const badgeFilters = Object.keys(badges).filter((key) => badges[key]);
  if (badgeFilters.length > 0) {
    query.$or = [];
    if (badges.profileCompleted) {
      query.$or.push({ profileCompleted: true });
    }
    if (badges.ableToStartRightAway) {
      query.$or.push({ skills: "Able to start right away" });
    }
    // if (badges.trendingProfile) {

    // }
  }

  // if (shortlisted) {
  //   query.shortlistedStatus = shortlisted;
  // }

  // if (liked) {
  //   query.likedStatus = liked;
  // }

  // if (uploaded) {
  //   const dateRange = getDateRangeForUploadedFilter(uploaded);
  //   if (dateRange) {
  //     query.uploadedAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
  //   }
  // }

  const talents = await Talent.find(query);

  if (!talents.length) {
    return res.status(400).json({ error: "No matching results" });
  }
  res.status(200).json(talents);
};

const getTalentProfile = async (req, res) => {
  const { talentId } = req.params;

  const talent = await Talent.findById(talentId);

  if (!talent) return res.status(400).json({ error: "Talent not found!" });

  res.status(200).json(talent);
};

module.exports = {
  fetchAllTalents,
  fetchDynamicFilters,
  fetchFilteredTalents,
  getTalentProfile,
};
