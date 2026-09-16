/**
 * Vercel Serverless Function - Job Search Backend
 * Multi-source aggregator for Indeed, LinkedIn, Glassdoor, ZipRecruiter
 */

const RAPID_API_KEY = process.env.RAPIDAPI_KEY;

// Sample data - Replace with live API calls once RapidAPI keys are configured
const SAMPLE_JOBS = [
  {
    id: "sample_1",
    title: "Senior Manager, Organizational Development",
    company: "Bank of America",
    location: "Charlotte, NC",
    salary: "$130K-$160K",
    posted: "1 day ago",
    url: "https://careers.bankofamerica.com",
    source: "Indeed",
    fit: 9,
    interview: 9,
    pay: 9,
    fresh: 9,
    type: "manager"
  },
  {
    id: "sample_2",
    title: "Principal, Talent Strategy",
    company: "Morgan Stanley",
    location: "Remote",
    salary: "$140K-$170K",
    posted: "2 days ago",
    url: "https://morganstanley.tal.net",
    source: "LinkedIn",
    fit: 8,
    interview: 8,
    pay: 9,
    fresh: 9,
    type: "ic"
  },
  {
    id: "sample_3",
    title: "Manager, Learning Operations",
    company: "Goldman Sachs",
    location: "Remote",
    salary: "$135K-$165K",
    posted: "3 days ago",
    url: "https://www.goldmansachs.com/careers",
    source: "Glassdoor",
    fit: 8,
    interview: 8,
    pay: 9,
    fresh: 8,
    type: "manager"
  },
  {
    id: "sample_4",
    title: "Senior Manager, Strategic Initiatives",
    company: "Schwab",
    location: "Austin, TX",
    salary: "$125K-$155K",
    posted: "4 days ago",
    url: "https://jobs.schwab.com",
    source: "ZipRecruiter",
    fit: 7,
    interview: 7,
    pay: 8,
    fresh: 7,
    type: "manager"
  },
  {
    id: "sample_5",
    title: "Director, Workforce Development",
    company: "Vanguard",
    location: "Remote",
    salary: "$150K-$180K",
    posted: "5 days ago",
    url: "https://www.vanguard.com/careers",
    source: "Indeed",
    fit: 9,
    interview: 8,
    pay: 9,
    fresh: 8,
    type: "manager"
  }
];

function scoreJob(job) {
  let fitScore = 5;
  let interviewScore = 5;
  let payScore = 5;
  const freshScore = 9;

  const titleLower = job.title.toLowerCase();

  if (titleLower.includes("manager") || titleLower.includes("director")) {
    fitScore = 9;
  } else if (titleLower.includes("principal") || titleLower.includes("senior consultant")) {
    fitScore = 8;
  } else if (titleLower.includes("senior") || titleLower.includes("lead")) {
    fitScore = 7;
  }

  if (titleLower.includes("talent") || titleLower.includes("development") || 
      titleLower.includes("organizational") || titleLower.includes("strategy")) {
    interviewScore = 9;
  } else if (titleLower.includes("operations") || titleLower.includes("program")) {
    interviewScore = 8;
  }

  if (job.salary) {
    const salaryLower = job.salary.toLowerCase();
    if (salaryLower.includes("150") || salaryLower.includes("160") || 
        salaryLower.includes("170") || salaryLower.includes("180")) {
      payScore = 9;
    } else if (salaryLower.includes("130") || salaryLower.includes("140")) {
      payScore = 8;
    } else if (salaryLower.includes("120")) {
      payScore = 7;
    }
  }

  return {
    fit: fitScore,
    interview: interviewScore,
    pay: payScore,
    fresh: freshScore
  };
}

async function getAllJobs() {
  try {
    let jobs = [...SAMPLE_JOBS];
    
    jobs = jobs.map(job => {
      const scores = scoreJob(job);
      return {
        ...job,
        ...scores,
        overall: Math.round((scores.fit + scores.interview + scores.pay + scores.fresh) / 4)
      };
    });

    jobs = jobs.filter(job => job.overall >= 7);
    jobs.sort((a, b) => b.overall - a.overall);

    return jobs;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.url === '/api/jobs' || req.url === '/' || req.url === '') {
    try {
      const jobs = await getAllJobs();
      res.status(200).json({
        success: true,
        count: jobs.length,
        jobs: jobs,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else if (req.url === '/api/health') {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};
