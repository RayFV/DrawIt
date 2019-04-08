# DrawIt
## 開發理念：

有時候我們會認為在某件事情上一直使用抽籤是公平的，而且每個人都會被抽到。  
但其實當<b>數量很多</b>而<b>抽籤次數不頻繁</b>時，最常被抽到和最不常被抽到的比例是很懸殊的（例如4:1） 。  
這種狀況的發生會破壞當初覺得“每個人都會被抽到”的想法。  
因此此軟體的開發目的是想要讓大家真的有被抽到的可能性，也保留了抽籤的隨機性。  


## 記憶抽的權重演算法
初始權重值 = 組別數量

執行抽籤後：

被抽到的權重 = 組別數量 * 0.3 (無條件捨去小數)

沒被抽到的權重 = 原本權重 + 組別數量 * 0.67 （取小數兩位，四捨五入）