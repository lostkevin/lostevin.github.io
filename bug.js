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

renameButton();
window.loop = setInterval(check_list, 2500);


function check_list() {
  document.getElementById("sp_set").click();
  setTimeout("document.getElementById('sp_st').click()", 1000);
}
