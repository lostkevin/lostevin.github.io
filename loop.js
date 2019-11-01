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

var count = 0;
var ws = new WebSocket("ws://127.0.0.1:6700");
var lastRoomState = {
  "Waiting": [],
  "Playing": []
};
var permit_group = [601691323, 959997346];

ws.onmessage = function (evt) {
  context = JSON.parse(evt.data);
  if (context["message_type"] === "group") {
    if (permit_group.indexOf(context["group_id"]) != -1) {
      if (context["message"] === "?待机" || context["message"] === "？待机") {
        var RoomState = (() => {
          document.getElementById("sp_set").click();
          sleep(1500);
          document.getElementById("sp_st").click();
          return getRoomState()
        })();
        var players = RoomState.Waiting;
        var pcnt = players.length;
        var Info = {
          "action": "send_group_msg",
          "params": {
            "group_id": context["group_id"],
            "message": ""
          }
        };
        Info["params"]["message"] = "当前准备:" + pcnt + "人";
        for (var i = 0; i < pcnt; i++) {
          Info["params"]["message"] += "\n" + players[i];
        }
        ws.send(JSON.stringify(Info));
      }
      if (context["message"] === "？大会室" || context["message"] === "?大会室") {
        var RoomState = (() => {
          document.getElementById("sp_set").click();
          sleep(1500);
          document.getElementById("sp_st").click();
          return getRoomState()
        })();
        var Info = {
          "action": "send_group_msg",
          "params": {
            "group_id": context["group_id"],
            "message": ""
          }
        };
        Info["params"]["message"] = "当前准备" + RoomState.Waiting.length + "人:";
        for (var i = 0; i < RoomState.Waiting.length; i++) {
          Info["params"]["message"] += "\n" + RoomState.Waiting[i];
        }
        if (RoomState.Playing.length > 0) {
          Info["params"]["message"] += "\n对战中" + RoomState.Playing.length + "桌:";
          for (var i = 0; i < RoomState.Playing.length; i++) {
            Info["params"]["message"] += "\n";
            for (var j = 0; j < 4; j++) {
              Info["params"]["message"] += RoomState.Playing[i][j] + " ";
            }
          }
        }
        ws.send(JSON.stringify(Info));
      }
    }
  }
};

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

async function loop_start() {
  renameButton();
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

  setTimeout("InitRoom()", 2000);
}

function loop_stop() {
  clearInterval(window.loop);
  e = document.getElementById("btn");
  e.value = "开始循环:满4人即开";
  e.setAttribute("onclick", "loop_start()");
  document.getElementById("lcnt").innerText = window.loopcnt;
}



function stck() {
  window.loopcnt++;
  var pcnt = 0;
  var _span_ = document.getElementsByTagName("span");

  for (var i = 0; i < _span_.length; i++) {
    if (_span_[i].innerText === "准备开始") {
      pcnt++;
      _span_[i].parentNode.setAttribute("id", "sbt_" + pcnt);
    }
    if (_span_[i].innerText === "对局开始") {
      _span_[i].parentNode.setAttribute("id", "btn_st");
    }
    if (_span_[i].innerText === "随机坐席（后台）") {
      _span_[i].parentNode.setAttribute("id", "btn_rand");
    }
  }

  if (pcnt >= 4) {
    document.getElementById("sbt_1").click();
    setTimeout("document.getElementById('sbt_2').click()", 1000);
    setTimeout("document.getElementById('sbt_3').click()", 2000);
    setTimeout("document.getElementById('sbt_4').click()", 3000);
    setTimeout("document.getElementById('btn_rand').click()", 4000);
    setTimeout("document.getElementById('btn_st').click()", 5000);
  }
  document.getElementById("lcnt").innerText = window.loopcnt;
}

function check_list() {
  //刷新
  renameButton();
  document.getElementById("sp_set").click();
  setTimeout("document.getElementById('sp_st').click()", 1000);
  //获取房间状态
  setTimeout("checkOpenGameState(getRoomState())", 2000)
  setTimeout("stck()", 2500);
}

//javascript:void((function(){var e=document.createElement('script');e.setAttribute('src','/loop.js');document.body.appendChild(e);})());

function InitRoom() {
  lastRoomState = getRoomState();
  console.log("lastRoomState:");
  console.log(JSON.stringify(lastRoomState));
}

//刷新后调用,解析元素得到比赛中以及准备中的ID,更新比赛桌
function getRoomState() {
  var hashs = {};
  var _li_ = document.getElementsByTagName("li");
  var RoomState = {
    "Waiting": [],
    "Playing": []
  };
  RoomState.Waiting = [];
  RoomState.Playing = [];
  for (var i = 0; i < _li_.length; i++) {
    texts = _li_[i].innerText.split("\n");
    if (texts.length != 1 && !hashs[texts[0]]) {
      RoomState.Waiting.push(texts[0]);
      hashs[texts[0]] = true;
    } else
      RoomState.Playing.push(texts[0]);
  }

  if (RoomState.Playing.length % 4 != 0) {
    console.log("Room State Error:");
    console.log(JSON.stringify(RoomState));
    RoomState = {
      "Waiting": [],
      "Playing": []
    };
  }
  console.log("Room State: ");
  console.log(JSON.stringify(RoomState));
  RoomState.Playing = transformToTableArray(RoomState.Playing);
  return RoomState;
}

//检查房间状态,若有新桌子则会发送开始消息
function checkOpenGameState(RoomState) {
  console.log("lastRoomState:");
  console.log(JSON.stringify(lastRoomState));
  lastPlaying = lastRoomState.Playing;
  Playing = RoomState.Playing;
  for (var i = 0; i < Playing.length; i++) {
    var j = 0;
    for (; j < lastPlaying.length; j++) {
      if (Playing[i].sort().toString() === lastPlaying[j].sort().toString()) {
        break;
      }
    }
    if (j == lastPlaying.length) {
      permit_group.forEach((v) => {
        //新桌,发送开始对局
        var Info = {
          "action": "send_group_msg",
          "params": {
            "group_id": v,
            "message": ""
          }
        };
        Info["params"]["message"] = Playing[i][0] + "," + Playing[i][1] + "," + Playing[i][2] + "," + Playing[i][3] + "的对局开始了";
        ws.send(JSON.stringify(Info));
      });
    }
  }

  if (count == 5) {
    //发送等待消息
    pcnt = RoomState.Waiting.length;
    if (lastRoomState.Waiting.sort().toString() != RoomState.Waiting.sort().toString() && pcnt > 0 && pcnt < 4) {
      permit_group.forEach((v) => {
        var Info = {
          "action": "send_group_msg",
          "params": {
            "group_id": v,
            "message": ""
          }
        };
        Info["params"]["message"] = pcnt + "q" + (4 - pcnt) + ", 请尽快加入比赛场474063";
        ws.send(JSON.stringify(Info));
      });
    }
    count = 0;
    lastRoomState.Waiting = RoomState.Waiting;
  }
  count++;
  lastRoomState.Playing = RoomState.Playing;
}
  function transformToTableArray(Players) {
    var result = [];
    for (var i = 0; i < Players.length / 4; i++) {
      slice = Players.slice(4 * i, 4 * i + 4);
      if (!isAllEqual(slice) && !checkInList(result, slice))
        result.push(slice);
    }
    return result;
  }

  function checkInList(Lists, List) {
    for (var i = 0; i < Lists.length; i++) {
      if (List.sort().toString() == Lists[i].sort().toString())
        return true;
    }
    return false;
  }

  function isAllEqual(a) {
    return !a.length || !a.some((v, i) => {
      return v !== a[0];
    });
  }

  function renameButton() {
    var _span_ = document.getElementsByTagName("span");
    for (var i = 0; i < _span_.length; i++) {
      if (_span_[i].innerText === "对局管理") {
        _span_[i].setAttribute("id", "sp_st");
      }
      if (_span_[i].innerText === "赛事设定") {
        _span_[i].setAttribute("id", "sp_set");
      }
    }
  }
