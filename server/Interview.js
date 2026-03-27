import express from "express";

const router = express.Router();
global.sessions = global.sessions || {};
const sessions = global.sessions;

// ================= DSA QUESTIONS =================
const dsaQuestions = [
"Two Sum II","3Sum","Longest Substring Without Repeating Characters",
"Container With Most Water","Group Anagrams","Product of Array Except Self",
"Longest Palindromic Substring","Search in Rotated Sorted Array",
"Find Minimum in Rotated Sorted Array","Number of Islands",
"Course Schedule","Clone Graph","Pacific Atlantic Water Flow",
"Rotting Oranges","Top K Frequent Elements","Kth Largest Element in Array",
"Subsets","Permutations","Combination Sum","Word Search",
"Binary Tree Level Order Traversal","Validate Binary Search Tree",
"Kth Smallest in BST","Lowest Common Ancestor BST",
"Binary Tree Right Side View","Construct Binary Tree from Preorder Inorder",
"Path Sum II","House Robber","House Robber II","Coin Change",
"Longest Increasing Subsequence","Partition Equal Subset Sum",
"Jump Game","Jump Game II","Unique Paths","Minimum Path Sum",
"Decode Ways","Word Break","Longest Common Subsequence",
"Edit Distance","Longest Consecutive Sequence"
];

// ================= API =================
router.post("/start", (req, res) => {

  const randomDSA =
    dsaQuestions[Math.floor(Math.random() * dsaQuestions.length)];

  const questions = [
    "Tell me about yourself.",
    "Solve this DSA problem: " + randomDSA,
    "Explain one technical project you have worked on.",
    "What is your biggest strength?",
    "Why should we hire you?"
  ];

  const sessionId = Date.now().toString();

  // 🔥 STORE SESSION (THIS WAS MISSING)
  sessions[sessionId] = {
    questions,
    index: 0
  };

  res.json({
    sessionId,
    question: questions[0],
    currentQuestion: 1,
    totalQuestions: questions.length,
    duration: 45 * 60
  });
});

router.post("/next", (req, res) => {
  const { sessionId } = req.body;

  const session = sessions[sessionId];

  if (!session) {
    return res.status(400).json({ error: "Invalid session" });
  }

  session.index++;

  if (session.index >= session.questions.length) {
    return res.json({ finished: true });
  }

  res.json({
    question: session.questions[session.index],
    currentQuestion: session.index + 1,
    finished: false
  });
});

router.post("/end", (req, res) => {
  res.json({ message: "Interview ended" });
});

export default router;