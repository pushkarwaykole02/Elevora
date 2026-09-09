"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const domains = [
  "All",
  "Arrays",
  "Strings",
  "Hashing",
  "Linked List",
  "Stack & Queue",
  "Binary Search",
  "Trees",
  "Graphs",
  "Recursion & Backtracking",
  "Dynamic Programming",
  "Greedy",
  "Heap / Priority Queue",
  "Frontend",
  "Database",
  "Concurrency",
  "Shell"
];

const challenges = [
  // 1. Arrays
  { id: "1", title: "Two Sum", difficulty: "Easy", domain: "Arrays", acceptance: "53.2%", url: "https://leetcode.com/problems/two-sum/" },
  { id: "26", title: "Remove Duplicates from Sorted Array", difficulty: "Easy", domain: "Arrays", acceptance: "56.4%", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
  { id: "121", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", domain: "Arrays", acceptance: "54.2%", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { id: "977", title: "Squares of a Sorted Array", difficulty: "Easy", domain: "Arrays", acceptance: "72.8%", url: "https://leetcode.com/problems/squares-of-a-sorted-array/" },
  { id: "724", title: "Find Pivot Index", difficulty: "Easy", domain: "Arrays", acceptance: "56.1%", url: "https://leetcode.com/problems/find-pivot-index/" },
  { id: "15", title: "3Sum", difficulty: "Medium", domain: "Arrays", acceptance: "34.2%", url: "https://leetcode.com/problems/3sum/" },
  { id: "53", title: "Maximum Subarray", difficulty: "Medium", domain: "Arrays", acceptance: "50.5%", url: "https://leetcode.com/problems/maximum-subarray/" },
  { id: "56", title: "Merge Intervals", difficulty: "Medium", domain: "Arrays", acceptance: "47.2%", url: "https://leetcode.com/problems/merge-intervals/" },
  { id: "189", title: "Rotate Array", difficulty: "Medium", domain: "Arrays", acceptance: "40.2%", url: "https://leetcode.com/problems/rotate-array/" },
  { id: "42", title: "Trapping Rain Water", difficulty: "Hard", domain: "Arrays", acceptance: "62.4%", url: "https://leetcode.com/problems/trapping-rain-water/" },

  // 2. Strings
  { id: "125", title: "Valid Palindrome", difficulty: "Easy", domain: "Strings", acceptance: "47.8%", url: "https://leetcode.com/problems/valid-palindrome/" },
  { id: "242", title: "Valid Anagram", difficulty: "Easy", domain: "Strings", acceptance: "64.1%", url: "https://leetcode.com/problems/valid-anagram/" },
  { id: "344", title: "Reverse String", difficulty: "Easy", domain: "Strings", acceptance: "77.5%", url: "https://leetcode.com/problems/reverse-string/" },
  { id: "387", title: "First Unique Character in a String", difficulty: "Easy", domain: "Strings", acceptance: "61.2%", url: "https://leetcode.com/problems/first-unique-character-in-a-string/" },
  { id: "14", title: "Longest Common Prefix", difficulty: "Easy", domain: "Strings", acceptance: "43.1%", url: "https://leetcode.com/problems/longest-common-prefix/" },
  { id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", domain: "Strings", acceptance: "35.1%", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { id: "49", title: "Group Anagrams", difficulty: "Medium", domain: "Strings", acceptance: "67.8%", url: "https://leetcode.com/problems/group-anagrams/" },
  { id: "5", title: "Longest Palindromic Substring", difficulty: "Medium", domain: "Strings", acceptance: "33.8%", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
  { id: "28", title: "Find the Index of the First Occurrence in a String", difficulty: "Medium", domain: "Strings", acceptance: "42.5%", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/" },
  { id: "115", title: "Distinct Subsequences", difficulty: "Hard", domain: "Strings", acceptance: "46.2%", url: "https://leetcode.com/problems/distinct-subsequences/" },

  // 3. Hashing
  { id: "217", title: "Contains Duplicate", difficulty: "Easy", domain: "Hashing", acceptance: "61.8%", url: "https://leetcode.com/problems/contains-duplicate/" },
  { id: "383", title: "Ransom Note", difficulty: "Easy", domain: "Hashing", acceptance: "60.5%", url: "https://leetcode.com/problems/ransom-note/" },
  { id: "202", title: "Happy Number", difficulty: "Easy", domain: "Hashing", acceptance: "56.2%", url: "https://leetcode.com/problems/happy-number/" },
  { id: "205", title: "Isomorphic Strings", difficulty: "Easy", domain: "Hashing", acceptance: "44.5%", url: "https://leetcode.com/problems/isomorphic-strings/" },
  { id: "290", title: "Word Pattern", difficulty: "Easy", domain: "Hashing", acceptance: "42.1%", url: "https://leetcode.com/problems/word-pattern/" },
  { id: "560", title: "Subarray Sum Equals K", difficulty: "Medium", domain: "Hashing", acceptance: "43.9%", url: "https://leetcode.com/problems/subarray-sum-equals-k/" },
  { id: "347", title: "Top K Frequent Elements", difficulty: "Medium", domain: "Hashing", acceptance: "62.8%", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
  { id: "128", title: "Longest Consecutive Sequence", difficulty: "Medium", domain: "Hashing", acceptance: "47.5%", url: "https://leetcode.com/problems/longest-consecutive-sequence/" },
  { id: "525", title: "Contiguous Array", difficulty: "Medium", domain: "Hashing", acceptance: "48.2%", url: "https://leetcode.com/problems/contiguous-array/" },
  { id: "76", title: "Minimum Window Substring", difficulty: "Hard", domain: "Hashing", acceptance: "42.9%", url: "https://leetcode.com/problems/minimum-window-substring/" },

  // 4. Linked List
  { id: "206", title: "Reverse Linked List", difficulty: "Easy", domain: "Linked List", acceptance: "76.5%", url: "https://leetcode.com/problems/reverse-linked-list/" },
  { id: "141", title: "Linked List Cycle", difficulty: "Easy", domain: "Linked List", acceptance: "49.8%", url: "https://leetcode.com/problems/linked-list-cycle/" },
  { id: "21", title: "Merge Two Sorted Lists", difficulty: "Easy", domain: "Linked List", acceptance: "64.2%", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { id: "876", title: "Middle of the Linked List", difficulty: "Easy", domain: "Linked List", acceptance: "78.1%", url: "https://leetcode.com/problems/middle-of-the-linked-list/" },
  { id: "234", title: "Palindrome Linked List", difficulty: "Easy", domain: "Linked List", acceptance: "52.4%", url: "https://leetcode.com/problems/palindrome-linked-list/" },
  { id: "19", title: "Remove Nth Node From End of List", difficulty: "Medium", domain: "Linked List", acceptance: "44.9%", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
  { id: "142", title: "Linked List Cycle II", difficulty: "Medium", domain: "Linked List", acceptance: "50.1%", url: "https://leetcode.com/problems/linked-list-cycle-ii/" },
  { id: "143", title: "Reorder List", difficulty: "Medium", domain: "Linked List", acceptance: "55.8%", url: "https://leetcode.com/problems/reorder-list/" },
  { id: "2", title: "Add Two Numbers", difficulty: "Medium", domain: "Linked List", acceptance: "42.8%", url: "https://leetcode.com/problems/add-two-numbers/" },
  { id: "25", title: "Reverse Nodes in k-Group", difficulty: "Hard", domain: "Linked List", acceptance: "58.1%", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },

  // 5. Stack & Queue
  { id: "20", title: "Valid Parentheses", difficulty: "Easy", domain: "Stack & Queue", acceptance: "41.5%", url: "https://leetcode.com/problems/valid-parentheses/" },
  { id: "232", title: "Implement Queue using Stacks", difficulty: "Easy", domain: "Stack & Queue", acceptance: "66.2%", url: "https://leetcode.com/problems/implement-queue-using-stacks/" },
  { id: "496", title: "Next Greater Element I", difficulty: "Easy", domain: "Stack & Queue", acceptance: "72.4%", url: "https://leetcode.com/problems/next-greater-element-i/" },
  { id: "1047", title: "Remove All Adjacent Duplicates In String", difficulty: "Easy", domain: "Stack & Queue", acceptance: "71.8%", url: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/" },
  { id: "155", title: "Min Stack", difficulty: "Easy", domain: "Stack & Queue", acceptance: "53.9%", url: "https://leetcode.com/problems/min-stack/" },
  { id: "739", title: "Daily Temperatures", difficulty: "Medium", domain: "Stack & Queue", acceptance: "66.5%", url: "https://leetcode.com/problems/daily-temperatures/" },
  { id: "150", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", domain: "Stack & Queue", acceptance: "48.2%", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
  { id: "622", title: "Design Circular Queue", difficulty: "Medium", domain: "Stack & Queue", acceptance: "52.4%", url: "https://leetcode.com/problems/design-circular-queue/" },
  { id: "901", title: "Online Stock Span", difficulty: "Medium", domain: "Stack & Queue", acceptance: "65.8%", url: "https://leetcode.com/problems/online-stock-span/" },
  { id: "239", title: "Sliding Window Maximum", difficulty: "Hard", domain: "Stack & Queue", acceptance: "46.8%", url: "https://leetcode.com/problems/sliding-window-maximum/" },

  // 6. Binary Search
  { id: "704", title: "Binary Search", difficulty: "Easy", domain: "Binary Search", acceptance: "57.1%", url: "https://leetcode.com/problems/binary-search/" },
  { id: "35", title: "Search Insert Position", difficulty: "Easy", domain: "Binary Search", acceptance: "45.2%", url: "https://leetcode.com/problems/search-insert-position/" },
  { id: "69", title: "Sqrt(x)", difficulty: "Easy", domain: "Binary Search", acceptance: "38.9%", url: "https://leetcode.com/problems/sqrtx/" },
  { id: "278", title: "First Bad Version", difficulty: "Easy", domain: "Binary Search", acceptance: "44.1%", url: "https://leetcode.com/problems/first-bad-version/" },
  { id: "744", title: "Find Smallest Letter Greater Than Target", difficulty: "Easy", domain: "Binary Search", acceptance: "47.8%", url: "https://leetcode.com/problems/find-smallest-letter-greater-than-target/" },
  { id: "33", title: "Search in Rotated Sorted Array", difficulty: "Medium", domain: "Binary Search", acceptance: "40.9%", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  { id: "74", title: "Search a 2D Matrix", difficulty: "Medium", domain: "Binary Search", acceptance: "49.5%", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
  { id: "162", title: "Find Peak Element", difficulty: "Medium", domain: "Binary Search", acceptance: "46.2%", url: "https://leetcode.com/problems/find-peak-element/" },
  { id: "875", title: "Koko Eating Bananas", difficulty: "Medium", domain: "Binary Search", acceptance: "48.9%", url: "https://leetcode.com/problems/koko-eating-bananas/" },
  { id: "4", title: "Median of Two Sorted Arrays", difficulty: "Hard", domain: "Binary Search", acceptance: "39.5%", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },

  // 7. Trees
  { id: "104", title: "Maximum Depth of Binary Tree", difficulty: "Easy", domain: "Trees", acceptance: "75.2%", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
  { id: "226", title: "Invert Binary Tree", difficulty: "Easy", domain: "Trees", acceptance: "77.1%", url: "https://leetcode.com/problems/invert-binary-tree/" },
  { id: "100", title: "Same Tree", difficulty: "Easy", domain: "Trees", acceptance: "60.4%", url: "https://leetcode.com/problems/same-tree/" },
  { id: "101", title: "Symmetric Tree", difficulty: "Easy", domain: "Trees", acceptance: "56.8%", url: "https://leetcode.com/problems/symmetric-tree/" },
  { id: "700", title: "Search in a Binary Search Tree", difficulty: "Easy", domain: "Trees", acceptance: "79.2%", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/" },
  { id: "102", title: "Binary Tree Level Order Traversal", difficulty: "Medium", domain: "Trees", acceptance: "67.1%", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  { id: "98", title: "Validate Binary Search Tree", difficulty: "Medium", domain: "Trees", acceptance: "32.5%", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
  { id: "236", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", domain: "Trees", acceptance: "60.9%", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
  { id: "105", title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", domain: "Trees", acceptance: "63.2%", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
  { id: "124", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", domain: "Trees", acceptance: "39.8%", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },

  // 8. Graphs
  { id: "733", title: "Flood Fill", difficulty: "Easy", domain: "Graphs", acceptance: "63.9%", url: "https://leetcode.com/problems/flood-fill/" },
  { id: "1971", title: "Find if Path Exists in Graph", difficulty: "Easy", domain: "Graphs", acceptance: "52.8%", url: "https://leetcode.com/problems/find-if-path-exists-in-graph/" },
  { id: "997", title: "Find the Town Judge", difficulty: "Easy", domain: "Graphs", acceptance: "49.5%", url: "https://leetcode.com/problems/find-the-town-judge/" },
  { id: "463", title: "Island Perimeter", difficulty: "Easy", domain: "Graphs", acceptance: "70.1%", url: "https://leetcode.com/problems/island-perimeter/" },
  { id: "559", title: "Maximum Depth of N-ary Tree", difficulty: "Easy", domain: "Graphs", acceptance: "74.2%", url: "https://leetcode.com/problems/maximum-depth-of-n-ary-tree/" },
  { id: "200", title: "Number of Islands", difficulty: "Medium", domain: "Graphs", acceptance: "58.2%", url: "https://leetcode.com/problems/number-of-islands/" },
  { id: "207", title: "Course Schedule", difficulty: "Medium", domain: "Graphs", acceptance: "46.2%", url: "https://leetcode.com/problems/course-schedule/" },
  { id: "133", title: "Clone Graph", difficulty: "Medium", domain: "Graphs", acceptance: "56.4%", url: "https://leetcode.com/problems/clone-graph/" },
  { id: "547", title: "Number of Provinces", difficulty: "Medium", domain: "Graphs", acceptance: "66.8%", url: "https://leetcode.com/problems/number-of-provinces/" },
  { id: "787", title: "Cheapest Flights Within K Stops", difficulty: "Hard", domain: "Graphs", acceptance: "38.5%", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" },

  // 9. Recursion & Backtracking
  { id: "509", title: "Fibonacci Number", difficulty: "Easy", domain: "Recursion & Backtracking", acceptance: "71.5%", url: "https://leetcode.com/problems/fibonacci-number/" },
  { id: "326", title: "Power of Three", difficulty: "Easy", domain: "Recursion & Backtracking", acceptance: "46.1%", url: "https://leetcode.com/problems/power-of-three/" },
  { id: "231", title: "Power of Two", difficulty: "Easy", domain: "Recursion & Backtracking", acceptance: "46.5%", url: "https://leetcode.com/problems/power-of-two/" },
  { id: "342", title: "Power of Four", difficulty: "Easy", domain: "Recursion & Backtracking", acceptance: "42.8%", url: "https://leetcode.com/problems/power-of-four/" },
  { id: "21-r", title: "Merge Two Sorted Lists (Recursive)", difficulty: "Easy", domain: "Recursion & Backtracking", acceptance: "64.2%", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { id: "78", title: "Subsets", difficulty: "Medium", domain: "Recursion & Backtracking", acceptance: "77.1%", url: "https://leetcode.com/problems/subsets/" },
  { id: "46", title: "Permutations", difficulty: "Medium", domain: "Recursion & Backtracking", acceptance: "78.4%", url: "https://leetcode.com/problems/permutations/" },
  { id: "39", title: "Combination Sum", difficulty: "Medium", domain: "Recursion & Backtracking", acceptance: "70.5%", url: "https://leetcode.com/problems/combination-sum/" },
  { id: "17", title: "Letter Combinations of a Phone Number", difficulty: "Medium", domain: "Recursion & Backtracking", acceptance: "60.2%", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/" },
  { id: "51", title: "N-Queens", difficulty: "Hard", domain: "Recursion & Backtracking", acceptance: "68.2%", url: "https://leetcode.com/problems/n-queens/" },

  // 10. Dynamic Programming
  { id: "70", title: "Climbing Stairs", difficulty: "Easy", domain: "Dynamic Programming", acceptance: "52.8%", url: "https://leetcode.com/problems/climbing-stairs/" },
  { id: "746", title: "Min Cost Climbing Stairs", difficulty: "Easy", domain: "Dynamic Programming", acceptance: "65.1%", url: "https://leetcode.com/problems/min-cost-climbing-stairs/" },
  { id: "338", title: "Counting Bits", difficulty: "Easy", domain: "Dynamic Programming", acceptance: "78.5%", url: "https://leetcode.com/problems/counting-bits/" },
  { id: "1137", title: "N-th Tribonacci Number", difficulty: "Easy", domain: "Dynamic Programming", acceptance: "64.2%", url: "https://leetcode.com/problems/n-th-tribonacci-number/" },
  { id: "118", title: "Pascal's Triangle", difficulty: "Easy", domain: "Dynamic Programming", acceptance: "73.9%", url: "https://leetcode.com/problems/pascals-triangle/" },
  { id: "322", title: "Coin Change", difficulty: "Medium", domain: "Dynamic Programming", acceptance: "43.9%", url: "https://leetcode.com/problems/coin-change/" },
  { id: "1143", title: "Longest Common Subsequence", difficulty: "Medium", domain: "Dynamic Programming", acceptance: "58.4%", url: "https://leetcode.com/problems/longest-common-subsequence/" },
  { id: "300", title: "Longest Increasing Subsequence", difficulty: "Medium", domain: "Dynamic Programming", acceptance: "54.9%", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
  { id: "62", title: "Unique Paths", difficulty: "Medium", domain: "Dynamic Programming", acceptance: "64.1%", url: "https://leetcode.com/problems/unique-paths/" },
  { id: "72", title: "Edit Distance", difficulty: "Hard", domain: "Dynamic Programming", acceptance: "55.2%", url: "https://leetcode.com/problems/edit-distance/" },

  // 11. Greedy
  { id: "605", title: "Can Place Flowers", difficulty: "Easy", domain: "Greedy", acceptance: "29.8%", url: "https://leetcode.com/problems/can-place-flowers/" },
  { id: "122", title: "Best Time to Buy and Sell Stock II", difficulty: "Easy", domain: "Greedy", acceptance: "66.4%", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/" },
  { id: "455", title: "Assign Cookies", difficulty: "Easy", domain: "Greedy", acceptance: "51.8%", url: "https://leetcode.com/problems/assign-cookies/" },
  { id: "860", title: "Lemonade Change", difficulty: "Easy", domain: "Greedy", acceptance: "54.2%", url: "https://leetcode.com/problems/lemonade-change/" },
  { id: "1005", title: "Maximize Sum Of Array After K Negations", difficulty: "Easy", domain: "Greedy", acceptance: "50.9%", url: "https://leetcode.com/problems/maximize-sum-of-array-after-k-negations/" },
  { id: "55", title: "Jump Game", difficulty: "Medium", domain: "Greedy", acceptance: "38.5%", url: "https://leetcode.com/problems/jump-game/" },
  { id: "45", title: "Jump Game II", difficulty: "Medium", domain: "Greedy", acceptance: "40.2%", url: "https://leetcode.com/problems/jump-game-ii/" },
  { id: "435", title: "Non-overlapping Intervals", difficulty: "Medium", domain: "Greedy", acceptance: "53.2%", url: "https://leetcode.com/problems/non-overlapping-intervals/" },
  { id: "134", title: "Gas Station", difficulty: "Medium", domain: "Greedy", acceptance: "45.1%", url: "https://leetcode.com/problems/gas-station/" },
  { id: "135", title: "Candy", difficulty: "Hard", domain: "Greedy", acceptance: "43.9%", url: "https://leetcode.com/problems/candy/" },

  // 12. Heap / Priority Queue
  { id: "703", title: "Kth Largest Element in a Stream", difficulty: "Easy", domain: "Heap / Priority Queue", acceptance: "56.4%", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" },
  { id: "1046", title: "Last Stone Weight", difficulty: "Easy", domain: "Heap / Priority Queue", acceptance: "65.2%", url: "https://leetcode.com/problems/last-stone-weight/" },
  { id: "506", title: "Relative Ranks", difficulty: "Easy", domain: "Heap / Priority Queue", acceptance: "71.4%", url: "https://leetcode.com/problems/relative-ranks/" },
  { id: "2335", title: "Minimum Amount of Time to Fill Cups", difficulty: "Easy", domain: "Heap / Priority Queue", acceptance: "58.1%", url: "https://leetcode.com/problems/minimum-amount-of-time-to-fill-cups/" },
  { id: "1337", title: "The K Weakest Rows in a Matrix", difficulty: "Easy", domain: "Heap / Priority Queue", acceptance: "73.2%", url: "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/" },
  { id: "215", title: "Kth Largest Element in an Array", difficulty: "Medium", domain: "Heap / Priority Queue", acceptance: "66.5%", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
  { id: "347", title: "Top K Frequent Elements", difficulty: "Medium", domain: "Heap / Priority Queue", acceptance: "62.8%", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
  { id: "973", title: "K Closest Points to Origin", difficulty: "Medium", domain: "Heap / Priority Queue", acceptance: "66.1%", url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
  { id: "621", title: "Task Scheduler", difficulty: "Medium", domain: "Heap / Priority Queue", acceptance: "57.4%", url: "https://leetcode.com/problems/task-scheduler/" },
  { id: "23", title: "Merge k Sorted Lists", difficulty: "Hard", domain: "Heap / Priority Queue", acceptance: "51.2%", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },

  // 13. Frontend
  { id: "2620", title: "Counter", difficulty: "Easy", domain: "Frontend", acceptance: "80.4%", url: "https://leetcode.com/problems/counter/" },
  { id: "2704", title: "To Be Or Not To Be", difficulty: "Easy", domain: "Frontend", acceptance: "75.3%", url: "https://leetcode.com/problems/to-be-or-not-to-be/" },
  { id: "2629", title: "Function Composition", difficulty: "Easy", domain: "Frontend", acceptance: "85.1%", url: "https://leetcode.com/problems/function-composition/" },
  { id: "2666", title: "Allow One Function Call", difficulty: "Easy", domain: "Frontend", acceptance: "88.2%", url: "https://leetcode.com/problems/allow-one-function-call/" },
  { id: "2619", title: "Array Prototype Last", difficulty: "Easy", domain: "Frontend", acceptance: "79.5%", url: "https://leetcode.com/problems/array-prototype-last/" },
  { id: "2625", title: "Flatten Deeply Nested Array", difficulty: "Medium", domain: "Frontend", acceptance: "64.5%", url: "https://leetcode.com/problems/flatten-deeply-nested-array/" },
  { id: "2627", title: "Debounce", difficulty: "Medium", domain: "Frontend", acceptance: "82.1%", url: "https://leetcode.com/problems/debounce/" },
  { id: "2622", title: "Cache With Time Limit", difficulty: "Medium", domain: "Frontend", acceptance: "70.3%", url: "https://leetcode.com/problems/cache-with-time-limit/" },
  { id: "2637", title: "Promise Time Limit", difficulty: "Medium", domain: "Frontend", acceptance: "78.4%", url: "https://leetcode.com/problems/promise-time-limit/" },
  { id: "2630", title: "Memoize II", difficulty: "Hard", domain: "Frontend", acceptance: "26.1%", url: "https://leetcode.com/problems/memoize-ii/" },

  // 14. Database
  { id: "175", title: "Combine Two Tables", difficulty: "Easy", domain: "Database", acceptance: "74.8%", url: "https://leetcode.com/problems/combine-two-tables/" },
  { id: "181", title: "Employees Earning More Than Their Managers", difficulty: "Easy", domain: "Database", acceptance: "69.5%", url: "https://leetcode.com/problems/employees-earning-more-than-their-managers/" },
  { id: "196", title: "Duplicate Emails", difficulty: "Easy", domain: "Database", acceptance: "71.2%", url: "https://leetcode.com/problems/duplicate-emails/" },
  { id: "183", title: "Customers Who Never Order", difficulty: "Easy", domain: "Database", acceptance: "67.8%", url: "https://leetcode.com/problems/customers-who-never-order/" },
  { id: "595", title: "Big Countries", difficulty: "Easy", domain: "Database", acceptance: "76.1%", url: "https://leetcode.com/problems/big-countries/" },
  { id: "177", title: "Nth Highest Salary", difficulty: "Medium", domain: "Database", acceptance: "40.1%", url: "https://leetcode.com/problems/nth-highest-salary/" },
  { id: "176", title: "Second Highest Salary", difficulty: "Medium", domain: "Database", acceptance: "38.5%", url: "https://leetcode.com/problems/second-highest-salary/" },
  { id: "184", title: "Department Highest Salary", difficulty: "Medium", domain: "Database", acceptance: "50.8%", url: "https://leetcode.com/problems/department-highest-salary/" },
  { id: "178", title: "Rank Scores", difficulty: "Medium", domain: "Database", acceptance: "55.4%", url: "https://leetcode.com/problems/rank-scores/" },
  { id: "262", title: "Trips and Users", difficulty: "Hard", domain: "Database", acceptance: "36.5%", url: "https://leetcode.com/problems/trips-and-users/" },

  // 15. Concurrency
  { id: "1114", title: "Print in Order", difficulty: "Easy", domain: "Concurrency", acceptance: "68.2%", url: "https://leetcode.com/problems/print-in-order/" },
  { id: "1279", title: "Traffic Light Intersection", difficulty: "Easy", domain: "Concurrency", acceptance: "72.5%", url: "https://leetcode.com/problems/traffic-light-intersection/" },
  { id: "1115", title: "Print FooBar Alternately", difficulty: "Easy", domain: "Concurrency", acceptance: "60.4%", url: "https://leetcode.com/problems/print-foobar-alternately/" },
  { id: "1116", title: "Print Zero Even Odd", difficulty: "Easy", domain: "Concurrency", acceptance: "59.2%", url: "https://leetcode.com/problems/print-zero-even-odd/" },
  { id: "1188", title: "Design Bounded Blocking Queue", difficulty: "Easy", domain: "Concurrency", acceptance: "73.2%", url: "https://leetcode.com/problems/design-bounded-blocking-queue/" },
  { id: "1117", title: "Building H2O", difficulty: "Medium", domain: "Concurrency", acceptance: "58.1%", url: "https://leetcode.com/problems/building-h2o/" },
  { id: "1195", title: "Fizz Buzz Multithreaded", difficulty: "Medium", domain: "Concurrency", acceptance: "57.8%", url: "https://leetcode.com/problems/fizz-buzz-multithreaded/" },
  { id: "1242", title: "Web Crawler Multithreaded", difficulty: "Medium", domain: "Concurrency", acceptance: "48.2%", url: "https://leetcode.com/problems/web-crawler-multithreaded/" },
  { id: "173", title: "Binary Search Tree Iterator", difficulty: "Medium", domain: "Concurrency", acceptance: "71.5%", url: "https://leetcode.com/problems/binary-search-tree-iterator/" },
  { id: "1226", title: "The Dining Philosophers", difficulty: "Hard", domain: "Concurrency", acceptance: "54.1%", url: "https://leetcode.com/problems/the-dining-philosophers/" },

  // 16. Shell
  { id: "195", title: "Tenth Line", difficulty: "Easy", domain: "Shell", acceptance: "33.5%", url: "https://leetcode.com/problems/tenth-line/" },
  { id: "193", title: "Valid Phone Numbers", difficulty: "Easy", domain: "Shell", acceptance: "26.4%", url: "https://leetcode.com/problems/valid-phone-numbers/" },
  { id: "125-s", title: "Valid Palindrome", difficulty: "Easy", domain: "Shell", acceptance: "47.8%", url: "https://leetcode.com/problems/valid-palindrome/" },
  { id: "344-s", title: "Reverse String", difficulty: "Easy", domain: "Shell", acceptance: "77.5%", url: "https://leetcode.com/problems/reverse-string/" },
  { id: "58-s", title: "Length of Last Word", difficulty: "Easy", domain: "Shell", acceptance: "43.1%", url: "https://leetcode.com/problems/length-of-last-word/" },
  { id: "192", title: "Word Frequency", difficulty: "Medium", domain: "Shell", acceptance: "25.6%", url: "https://leetcode.com/problems/word-frequency/" },
  { id: "194", title: "Transpose File", difficulty: "Medium", domain: "Shell", acceptance: "26.1%", url: "https://leetcode.com/problems/transpose-file/" },
  { id: "468", title: "Validate IP Address", difficulty: "Medium", domain: "Shell", acceptance: "27.5%", url: "https://leetcode.com/problems/validate-ip-address/" },
  { id: "8", title: "String to Integer (atoi)", difficulty: "Medium", domain: "Shell", acceptance: "16.8%", url: "https://leetcode.com/problems/string-to-integer-atoi/" },
  { id: "65", title: "Valid Number", difficulty: "Hard", domain: "Shell", acceptance: "18.2%", url: "https://leetcode.com/problems/valid-number/" }
];

export default function CodingChallengesPage() {
  const [activeDomain, setActiveDomain] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const savedProgress = localStorage.getItem("elevora-completed-challenges");
      if (savedProgress) {
        try {
          return JSON.parse(savedProgress);
        } catch (e) {
          console.error("Failed to parse progress", e);
        }
      }
    }
    return {};
  });

  const toggleCompletion = (id: string) => {
    const newCompleted = { ...completedQuestions, [id]: !completedQuestions[id] };
    setCompletedQuestions(newCompleted);
    localStorage.setItem("elevora-completed-challenges", JSON.stringify(newCompleted));
  };

  const filteredChallenges = challenges.filter((item) => {
    const matchesDomain = activeDomain === "All" || item.domain === activeDomain;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "var(--color-primary)"; 
      case "Medium": return "#f59e0b"; // Yellow
      case "Hard": return "#ef4444"; // Red
      default: return "var(--color-on-surface)";
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-label text-[var(--color-on-surface-variant)] mb-1">Practice</p>
        <h1 className="text-4xl font-headline font-black">Coding Challenges</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
          Master domain-specific top questions and track your progress.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] text-xl">
            search
          </span>
          <input
            type="search"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface-container-low)] ghost-border rounded-xl text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Domain Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {domains.map((domain) => (
          <button
            key={domain}
            onClick={() => setActiveDomain(domain)}
            className={`px-5 py-2 rounded-full text-sm font-headline font-medium transition-all ${
              activeDomain === domain
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "bg-[var(--color-surface-container)] ghost-border text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {filteredChallenges.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[var(--color-on-surface-variant)] text-sm">
            No challenges found for &ldquo;{activeDomain}&rdquo; matching your search.
          </div>
        ) : (
          filteredChallenges.map((item) => {
            const isCompleted = !!completedQuestions[item.id];
            const diffColor = getDifficultyColor(item.difficulty);
            
            return (
              <div
                key={`${item.id}-${item.domain}`}
                className="group bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4 transition-all duration-400 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-[10px] font-label px-2 py-1 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${diffColor} 15%, transparent)`,
                        color: diffColor,
                      }}
                    >
                      {item.difficulty}
                    </span>
                    <span className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">category</span>
                      {item.domain}
                    </span>
                  </div>
                  
                  <h3 className="font-headline font-bold text-lg text-[var(--color-on-surface)]">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0 justify-end">
                  <button
                    onClick={() => toggleCompletion(item.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border ${
                      isCompleted 
                        ? "bg-[#22c55e33] border-[#22c55e80] text-[#22c55e] hover:bg-[#22c55e4d]" 
                        : "bg-transparent border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    }`}
                    title={isCompleted ? "Mark as uncompleted" : "Mark as completed"}
                  >
                    <span className="material-symbols-outlined">
                      {isCompleted ? "check_circle" : "circle"}
                    </span>
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-110"
                  >
                    Solve
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
