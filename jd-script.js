// ==UserScript==
// @name         jd-sku
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  get jd list sku id
// @author       wangzhan
// @match        *://list.jd.com/*
// @match        *://*.1688.com/*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
.plugin-btn:hover {
    color: var(--bs-btn-hover-color);
    background-color: var(--bs-btn-hover-bg);
    border-color: var(--bs-btn-hover-border-color);
}
.plugin-btn {
    --bs-btn-padding-x: 0.75rem;
    --bs-btn-padding-y: 0.375rem;
    --bs-btn-font-family: ;
    --bs-btn-font-size: 10px;
    --bs-btn-font-weight: 400;
    --bs-btn-line-height: 1.5;
    --bs-btn-color: #212529;
    --bs-btn-bg: transparent;
    --bs-btn-border-width: var(--bs-border-width);
    --bs-btn-border-color: transparent;
    --bs-btn-border-radius: 0.375rem;
    --bs-btn-hover-border-color: transparent;
    --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15),0 1px 1px rgba(0, 0, 0, 0.075);
    --bs-btn-disabled-opacity: 0.65;
    --bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5);
    display: inline-block;
    padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
    font-family: var(--bs-btn-font-family);
    font-size: var(--bs-btn-font-size);
    font-weight: var(--bs-btn-font-weight);
    line-height: var(--bs-btn-line-height);
    color: var(--bs-btn-color);
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
    border-radius: var(--bs-btn-border-radius);
    background-color: var(--bs-btn-bg);
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}
.plugin-btn-primary {
    --bs-btn-color: #fff;
    --bs-btn-bg: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #0b5ed7;
    --bs-btn-hover-border-color: #0a58ca;
    --bs-btn-focus-shadow-rgb: 49,132,253;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #0a58ca;
    --bs-btn-active-border-color: #0a53be;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #0d6efd;
    --bs-btn-disabled-border-color: #0d6efd;
}
.plugin-btn-success {
    --bs-btn-color: #fff;
    --bs-btn-bg: #198754;
    --bs-btn-border-color: #198754;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #157347;
    --bs-btn-hover-border-color: #146c43;
    --bs-btn-focus-shadow-rgb: 60,153,110;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #146c43;
    --bs-btn-active-border-color: #13653f;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #198754;
    --bs-btn-disabled-border-color: #198754;
}

.plugin-btn-danger {
    --bs-btn-color: #fff;
    --bs-btn-bg: #dc3545;
    --bs-btn-border-color: #dc3545;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #bb2d3b;
    --bs-btn-hover-border-color: #b02a37;
    --bs-btn-focus-shadow-rgb: 225,83,97;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #b02a37;
    --bs-btn-active-border-color: #a52834;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #dc3545;
    --bs-btn-disabled-border-color: #dc3545;
}
`);

// 当前域名
var currentDomain = window.location.hostname;
// UI
var appendHtml = `<ul id="box" style="position:fixed; top:200px; left:0; z-index:9999; text-align:center;background:rgba(0,0,0,.5);padding:10px">
    <li style="color:#fff;">当前sku<span id="j_count">0</span>个</li>
    <li style="margin-top:10px"><button id="j_watch" class="plugin-btn plugin-btn-primary" type="button">开始抓取</button></li>
    <li style="margin-top:10px"><button id="j_clear" class="plugin-btn plugin-btn-danger" type="button">清空SKU</button></li>
    <li style="margin-top:10px"><button id="j_copy" class="plugin-btn plugin-btn-success" type="button">复制SKU</button></li>
  </ul>`;
const body = document.querySelector("body");
body.insertAdjacentHTML("beforeend", appendHtml);

// 定时器
var skuInterval = null;
// SKU列表
var skuList = [];
const jWatchBtn = document.querySelector("#j_watch");
const jCopyBtn = document.querySelector("#j_copy");
const jCount = document.querySelector("#j_count");
const jClear = document.querySelector("#j_clear");
// 监听按钮
jWatchBtn.addEventListener("click", function (evt) {
  if (skuInterval) {
    clearInterval(skuInterval);
    skuInterval = null;
    jWatchBtn.textContent = "开启抓取";
  } else {
    jWatchBtn.textContent = "暂停抓取";
    skuInterval = setInterval(() => {
      let curList = [];
      // 京东搜索
      if (currentDomain == "list.jd.com") {
        curList = getJDSkuId();
      }
      // 1688搜索
      if (currentDomain == "s.1688.com") {
        curList = get1688SkuId();
      }
      let _arr = Array.from(new Set(skuList.concat(curList)));
      if (_arr.length !== skuList.length) {
        skuList = _arr;
        console.log(`当前sku：${skuList.length}个`);
        jCount.textContent = skuList.length;
      }
    }, 100);
  }
});

// 复制按钮
jCopyBtn.addEventListener("click", function (evt) {
  console.log(`copy --> `, skuList);
  if (skuList.length == 0) {
    toast(`复制失败，未获取到sku！`);
    return;
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(skuList.join("\n"));
    toast(`成功复制${skuList.length}个sku到剪切板`);
  }
});

// 清空SKU
jClear.addEventListener("click", function (evt) {
  clearInterval(skuInterval);
  skuInterval = null;
  jWatchBtn.textContent = "开始抓取";
  skuList = [];
  jCount.textContent = skuList.length;
  toast("sku已全部清除");
});
// 复制京东SKU
function getJDSkuId() {
  let skuArr = [];
  const goodsList = document.querySelector("#J_goodsList");
  goodsList.querySelectorAll(".gl-item").forEach((item) => {
    let sku = item.getAttribute("data-sku");
    skuArr.push(`https://item.jd.com/${sku}.html`);
  });
  return skuArr;
}
// 复制1688SKU
function get1688SkuId() {
  let skuArr = [];
  const goodsList = document.querySelector("#sm-offer-list");
  goodsList.querySelectorAll(".mojar-element-title>a").forEach((item) => {
    let sku = item.getAttribute("href");
    if (sku.startsWith("https://detail.1688.com/")) skuArr.push(sku);
  });
  return skuArr;
}

function toast(message, duration) {
  duration = isNaN(duration) ? 1000 : duration;
  var m = document.createElement("div");
  m.innerHTML = message;
  m.style.cssText =
    "max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: rgb(255, 255, 255);line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 14px;";
  document.body.appendChild(m);
  setTimeout(function () {
    var d = 0.5;
    m.style.webkitTransition =
      "-webkit-transform " + d + "s ease-in, opacity " + d + "s ease-in";
    m.style.opacity = "0";
    setTimeout(function () {
      document.body.removeChild(m);
    }, d * 1000);
  }, 1000);
}
// 拖拽
window.onload = function () {
  var drag = document.getElementById("box");
  drag.onmousedown = function (e) {
    //获取鼠标按下位置相对于元素内部的x和y轴的偏移值
    var diffX = e.clientX - drag.offsetLeft;
    var diffY = e.clientY - drag.offsetTop;

    document.onmousemove = function (e) {
      //元素本身相对于视窗的偏移值
      var left = e.clientX - diffX;
      var top = e.clientY - diffY;

      //阻止元素离开视窗范围产生滚动条
      if (left < 0) {
        left = 0;
      } else if (left > window.innerWidth - drag.offsetWidth) {
        left = window.innerWidth - drag.offsetWidth;
      }
      if (top < 0) {
        top = 0;
      } else if (top > window.innerHeight - drag.offsetHeight) {
        top = window.innerHeight - drag.offsetHeight;
      }

      //将新位置的left和top值赋值给元素
      drag.style.left = left + "px";
      drag.style.top = top + "px";
    };

    document.onmouseup = function (e) {
      //鼠标抬起后，取消按下和抬起事件
      this.onmousedown = null;
      this.onmousemove = null;
    };
  };
};
