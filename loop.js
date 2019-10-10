window.loopcnt = 0; //计数

!(function () {
  //创建工具栏
  var newdiv = document.createElement("div");
  newdiv.style.cssText =
    "background:#66997B;width:100%;position:fixed;bottom:0;left:0;";
  //循环按钮
  var e = document.createElement("input");
  e.setAttribute("type", "button");
  e.setAttribute("id", "btn");
  e.setAttribute("value", "开始循环:满4人即开");
  e.setAttribute("onclick", "loop_start()");
  newdiv.appendChild(e);

  //次数按钮
  newdiv.appendChild(document.createTextNode("检查次数:"));
  var s = document.createElement("span");
  s.setAttribute("id", "lcnt");
  s.innerText = 0;
  newdiv.appendChild(s);

  //转换到天凤文本
  var e3 = document.createElement("textarea");
  e3.setAttribute("id", "th_txt");
  newdiv.appendChild(e3);

  var e2 = document.createElement("input");
  e2.setAttribute("type", "button");
  e2.setAttribute("value", "转成天凤记录");
  e2.setAttribute("onclick", "tenhou_log()");
  newdiv.appendChild(e2);
  var a = document.createElement("a");
  a.setAttribute("href", "http://tenhou.net/ranking_tool.html");
  a.setAttribute("target", "_blank");
  a.innerText = "天凤统计工具";
  newdiv.appendChild(a);

  document.body.appendChild(newdiv);
})();

function sleep(ms) {
  //暂停
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tenhou_log() {
  //L0000 | 00:00 | 四般南喰赤 | player4(+30.1,-5枚) player5(+10,0枚) player9(-12.0) player0(-28.1,+5枚)
  var btn = document.querySelector(
    "#root>div>header>div>div:nth-child(3)>div>div>div>div>button:nth-child(4)>span>span>span"
  );
  if (btn == null || btn == "") {
    return alert("请进入开比赛的页面执行此脚本");
  }
  btn.click();
  await sleep(3000);
  var x = document.getElementsByTagName("tr");
  var outstr = "";
  for (let i = x.length - 1; i > 0; i--) {
    var tmparr = [];
    tmparr = x[i].innerText.split(/\s+/g);
    outstr +=
      "L0000 | 00:00 | 四般南喰赤 | " +
      tmparr[3] +
      "(" +
      parseFloat(tmparr[4]) +
      ") " +
      tmparr[5] +
      "(" +
      parseFloat(tmparr[6]) +
      ") " +
      tmparr[7] +
      "(" +
      parseFloat(tmparr[8]) +
      ") " +
      tmparr[9] +
      "(" +
      parseFloat(tmparr[10]) +
      ")\r\n";
  }
  document.getElementById("th_txt").value = outstr;
  alert("读取成功，可以利用【天凤统计工具】进行更详细的统计");
}

function loop_start() {
  var _span_ = document.getElementsByTagName("span");
  for (var i = 0; i < _span_.length; i++) {
    if (_span_[i].innerText === "对局管理") {
      _span_[i].setAttribute("id", "sp_st");
    }
    if (_span_[i].innerText === "赛事设定") {
      _span_[i].setAttribute("id", "sp_set");
    }
  }
  if (
    document.getElementById("sp_set") == null ||
    document.getElementById("sp_set") == ""
  ) {
    return alert("请进入开比赛的页面执行此脚本");
  }

  document.getElementById("sp_set").click();
  setTimeout("document.getElementById('sp_st').click()", 1000);
  window.loopcnt = 0;

  window.loop = setInterval(check_list, 10000);
  e = document.getElementById("btn");
  e.setAttribute("onclick", "loop_stop()");
  e.value = "停止循环";
  document.getElementById("lcnt").innerText = window.loopcnt;
}

function loop_stop() {
  clearInterval(window.loop);
  e = document.getElementById("btn");
  e.value = "开始循环:满4人即开";
  e.setAttribute("onclick", "loop_start()");
  document.getElementById("lcnt").innerText = window.loopcnt;
}

var count = 0;
var ws = new WebSocket("ws://127.0.0.1:6700");
ws.onopen = function (evt) {};
ws.onmessage = function (evt) {
  context = JSON.parse(evt.data);
  console.log(context);
  if (context["message_type"] === "group") {
    if (context["group_id"] == 601691323) {
      if (context["message"] === "!待机" || context["message"] === "！待机") {
        var players = get_player();
        var pcnt = players.length;
        var Info = {
          "action": "send_group_msg",
          "params": {
            "group_id": 601691323,
            "message": ""
          }
        };
        Info["params"]["message"] = "当前准备:" + pcnt + "人";
        for (var i = 0; i < pcnt; i++) {
          Info["params"]["message"] += "\n" + players[i];
        }
        ws.send(JSON.stringify(Info));
      }
    }
  }
};
ws.onclose = function (evt) {};
var last_pcnt = 0;
var open_player = [];
var checkstate = false;

function stck() {
  window.loopcnt++;
  var IDs = [];
  var hashs = {};
  var pcnt = 0;
  var _span_ = document.getElementsByTagName("span");

  for (var i = 0; i < _span_.length; i++) {
    if (_span_[i].innerText === "准备开始") {
      ID = _span_[i]["parentNode"]["offsetParent"]["childNodes"][0].innerText;
      if (!hashs[ID]) {
        pcnt++;
        IDs.push(ID);
        if (checkstate && open_player.indexOf(ID) > -1) {
          checkstate = false;
        }
        hashs[ID] = true;
        _span_[i].parentNode.setAttribute("id", "sbt_" + pcnt);
      }
    }
    if (_span_[i].innerText === "对局开始") {
      _span_[i].parentNode.setAttribute("id", "btn_st");
    }
    if (_span_[i].innerText === "随机坐席（后台）") {
      _span_[i].parentNode.setAttribute("id", "btn_rand");
    }
  }
  if (checkstate) {
    open_player = open_player.slice(0, 4) //not include 4
    var Info = {
      "action": "send_group_msg",
      "params": {
        "group_id": 601691323,
        "message": ""
      }
    };
    Info["params"]["message"] = open_player[0] + "," + open_player[1] + "," + open_player[2] + "," + open_player[3] + "的对局开始了";
    ws.send(JSON.stringify(Info));
    checkstate = false;
  }
  if (pcnt >= 4) {
    document.getElementById("sbt_1").click();
    setTimeout("document.getElementById('sbt_2').click()", 1000);
    setTimeout("document.getElementById('sbt_3').click()", 2000);
    setTimeout("document.getElementById('sbt_4').click()", 3000);
    setTimeout("document.getElementById('btn_rand').click()", 4000);
    setTimeout("document.getElementById('btn_st').click()", 5000);
    open_player = IDs.slice(0,4);
    checkstate = true;
  } else {
    //< 4 人
    //10sec / check, 这样约100s
    if (count == 5) {
      //调用cqhttp api
      if (pcnt != last_pcnt && pcnt != 0) {
        var Info = {
          "action": "send_group_msg",
          "params": {
            "group_id": 601691323,
            "message": ""
          }
        };
        Info["params"]["message"] = pcnt + "q" + (4 - pcnt) + ", 请尽快加入比赛场474063";
        ws.send(JSON.stringify(Info));
      }
      last_pcnt = pcnt;
      count = 0;
    }
    count++;
  }
  document.getElementById("lcnt").innerText = window.loopcnt;
}

function check_list() {
  document.getElementById("sp_set").click();
  setTimeout("document.getElementById('sp_st').click()", 1000);
  setTimeout("stck()", 2000);
}

//javascript:void((function(){var e=document.createElement('script');e.setAttribute('src','/loop.js');document.body.appendChild(e);})());

function get_player() {
  document.getElementById("sp_set").click();
  sleep(1500);
  document.getElementById("sp_st").click();
  var IDs = [];
  var hashs = {};
  var _span_ = document.getElementsByTagName("span");
  for (var i = 0; i < _span_.length; i++) {
    if (_span_[i].innerText === "准备开始") {
      ID = _span_[i]["parentNode"]["offsetParent"]["childNodes"][0].innerText;
      if (!hashs[ID]) {
        IDs.push(ID);
        hashs[ID] = true;
      }
    }
  }
  return IDs;
}
