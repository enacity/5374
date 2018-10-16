"use strict";

/**
  �G���A(���ݏ����̒n��j���Ǘ�����N���X�ł��B
*/
var AreaModel = function() {
  this.label;
  this.centerName;
  this.center;
  this.trash = new Array();
  /**
  �e�S�~�̃J�e�S���ɑ΂��āA�ł����߂̓��t���v�Z���܂��B
  */
  this.calcMostRect = function() {
    for (var i = 0; i < this.trash.length; i++) {
      this.trash[i].calcMostRect(this);
    }
  }
  /**
    �x�~���ԁi��ɔN���N�n�j���ǂ����𔻒肵�܂��B
  */
  this.isBlankDay = function(currentDate) {
    if (!this.center) {
        return false;
    }
    var period = [this.center.startDate, this.center.endDate];

    if (period[0].getTime() <= currentDate.getTime() &&
      currentDate.getTime() <= period[1].getTime()) {
      return true;
    }
    return false;
  }
  /**
    �S�~�����Z���^�[��o�^���܂��B
    ���O����v���邩�ǂ����Ŕ�����s���Ă���܂��B
  */
  this.setCenter = function(center_data) {
    for (var i in center_data) {
      if (this.centerName == center_data[i].name) {
        this.center = center_data[i];
      }
    }
  }
  /**
  �S�~�̃J�e�S���̃\�[�g���s���܂��B
  */
  this.sortTrash = function() {
    this.trash.sort(function(a, b) {
      if (a.mostRecent === undefined) return 1;
      if (b.mostRecent === undefined) return -1;
      var at = a.mostRecent.getTime();
      var bt = b.mostRecent.getTime();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    });
  }
}

/**
  �e�S�~�̃J�e�S�����Ǘ�����N���X�ł��B
*/
var TrashModel = function(_lable, _cell, remarks) {
  this.remarks = remarks;
  this.dayLabel;
  this.mostRecent;
  this.dayList;
  this.mflag = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  var monthSplitFlag=_cell.search(/:/)>=0
  if (monthSplitFlag) {
    var flag = _cell.split(":");
    this.dayCell = flag[0].split(" ");
    var mm = flag[1].split(" ");
  } else if (_cell.length == 2 && _cell.substr(0,1) == "*") {
    this.dayCell = _cell.split(" ");
    var mm = new Array();
  } else {
    this.dayCell = _cell.split(" ");
    var mm = new Array("4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3");
  }
  for (var m in mm) {
    this.mflag[mm[m] - 1] = 1;
  }
  this.label = _lable;
  this.description;
  this.regularFlg = 1;      // �������t���O�i�f�t�H���g�̓I��:1�j

  var result_text = "";
  var today = new Date();

  for (var j in this.dayCell) {
    if (this.dayCell[j].length == 1) {
      result_text += "���T" + this.dayCell[j] + "�j�� ";
    } else if (this.dayCell[j].length == 2 && this.dayCell[j].substr(0,1) != "*") {
      result_text += "��" + this.dayCell[j].charAt(1) + this.dayCell[j].charAt(0) + "�j�� ";
    } else if (this.dayCell[j].length == 2 && this.dayCell[j].substr(0,1) == "*") {
    } else if (this.dayCell[j].length == 10 && this.dayCell[j].substr(0,1) == "�u") {
      /**** MOD: PICK biweek, Ex:�u��20140401 ****/
      /****ADD****/
      result_text += "�u�T" + this.dayCell[j].charAt(1) + "�j ";
      this.regularFlg = 2;      // �u�T�t���O
      /****ADD****/
    } else {
      // �s�������̏ꍇ�iYYYYMMDD�w��j
      result_text = "�s��� ";
      this.regularFlg = 0;  // �������t���O�I�t
    }
  }
  if (monthSplitFlag){
    var monthList="";
    for (var m in this.mflag) {
      if (this.mflag[m]){
        if (monthList.length>0){
          monthList+=","
        }
        //m�𐮐���
        monthList+=((m-0)+1)
      }
    };
    monthList+="�� "
    result_text=monthList+result_text
  }
  this.dayLabel = result_text;


  this.getDateLabel = function() {
    if (this.mostRecent === undefined) {
	return this.getRemark() + "�s��";
    }
    var result_text = this.mostRecent.getFullYear() + "/" + (1 + this.mostRecent.getMonth()) + "/" + this.mostRecent.getDate();
    return this.getRemark() + this.dayLabel + " " + result_text;
  }

  var day_enum = ["��", "��", "��", "��", "��", "��", "�y"];

  function getDayIndex(str) {
    for (var i = 0; i < day_enum.length; i++) {
      if (day_enum[i] == str) {
        return i;
      }
    };
    return -1;
  }
  /**
   * ���̂��ݎ��W��������ȏ����������Ă���ꍇ���l��Ԃ��܂��B���W���f�[�^��"*n" �������Ă���ꍇ�ɗ��p����܂�
   */
  this.getRemark = function getRemark() {
    var ret = "";
    this.dayCell.forEach(function(day){
      if (day.substr(0,1) == "*") {
        remarks.forEach(function(remark){
          if (remark.id == day.substr(1,1)){
            ret += remark.text + "<br/>";
          }
        });
      };
    });
    return ret;
  }
  /**
  ���̃S�~�̔N�Ԃ̃S�~�̓����v�Z���܂��B
  �Z���^�[���x�~���Ԃ�����ꍇ�́A���̊��ԂP�T�Ԃ��炷�Ƃ����������s���Ă���܂��B
*/
  this.calcMostRect = function(areaObj) {
    var day_mix = this.dayCell;
    var result_text = "";
    var day_list = new Array();

    // �������̏ꍇ
    if (this.regularFlg == 1) {

      var today = new Date();

      // 12�� +3���@��\��
      for (var i = 0; i < MaxMonth; i++) {

        var curMonth = today.getMonth() + i;
        var curYear = today.getFullYear() + Math.floor(curMonth / 12);
        var month = (curMonth % 12) + 1;

        // ���W���������̓X�L�b�v
        if (this.mflag[month - 1] == 0) {
            continue;
        }
        for (var j in day_mix) {
          //�x�~���Ԃ�������A�����T�Ԃ��炷�B
          var isShift = false;

          //week=0����1�T�ڂł��B
          for (var week = 0; week < 5; week++) {
            //4��1�����N�_�Ƃ��đ�n�j���Ȃǂ��v�Z����B
            var date = new Date(curYear, month - 1, 1);
            var d = new Date(date);
            //�R���X�g���N�^�ł�낤�Ƃ���Ƃ��܂��s���Ȃ������B�B
            //
            //4��1������ɂ��ėj���̍����Ŏ��Ԃ�߂��A�ő�T�T�܂ł̑��������Ė��T��\��
            d.setTime(date.getTime() + 1000 * 60 * 60 * 24 *
              ((7 + getDayIndex(day_mix[j].charAt(0)) - date.getDay()) % 7) + week * 7 * 24 * 60 * 60 * 1000
            );
            //�N���N�n�x�ɂ̃X�L�b�v�Ή�
            if (SkipSuspend) {
              if (areaObj.isBlankDay(d)) {
                continue;
              }
            }
            //�N���N�n�̂��炵�̑Ή�
            //�x�~���ԂȂ�A����̓������P�T�Ԃ��炷
            if (areaObj.isBlankDay(d)) {
            if (WeekShift) {
                isShift = true;
              } else {
                continue;
              }
            }
      ////
            if (isShift) {
              d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
            }
            //�������̎��̂ݏ���������
            if (d.getMonth() != (month - 1) % 12) {
              continue;
            }
            //����̏T�̂ݏ�������
            if (day_mix[j].length > 1) {
              if ((week != day_mix[j].charAt(1) - 1) || ("*" == day_mix[j].charAt(0))) {
                continue;
              }
            }

            day_list.push(d);
          }
        }
      }
      /****ASS****/
    } else if (this.regularFlg == 2) {
      // �u�T����̏ꍇ�́Abasedate�Ɏw�菉����t���Z�b�g
      for (var j in day_mix) {
        var year = parseInt(day_mix[j].substr(2, 4));
        var month = parseInt(day_mix[j].substr(6, 2)) - 1;
        var day = parseInt(day_mix[j].substr(8, 2));
        var basedate = new Date(year, month, day);

        //week=0����1�T�ڂł��B
        for (var week = 0; week < 27; week++) {
          // basedate ���N�_�ɁA�ł��߂������T�ڂ��v�Z����B
          var d = new Date(date);
          // basedate ����ɁA�ő�53�T�܂ő��������Ċu�T��\��
          d.setTime( basedate.getTime() + week * 14 * 24 * 60 * 60 * 1000 );
          //�N���N�n�x�ɂ̃X�L�b�v�Ή�
          if (SkipSuspend) {
            if (areaObj.isBlankDay(d)) {
              continue;
            }
          }
          day_list.push(d);
        }
      }
    /***ADD*****/   
    } else {
      // �s�������̏ꍇ�́A���̂܂܎w�肳�ꂽ���t���Z�b�g����
      for (var j in day_mix) {
        var year = parseInt(day_mix[j].substr(0, 4));
        var month = parseInt(day_mix[j].substr(4, 2)) - 1;
        var day = parseInt(day_mix[j].substr(6, 2));
        var d = new Date(year, month, day);
        day_list.push(d);
      }
    }
    //�j���ɂ���Ă͓��t���ł͂Ȃ��̂ōŏI�I�Ƀ\�[�g����B
    //�\�[�g���Ȃ��Ă��Ȃ�ƂȂ肻���ȋC�����܂����A�Ƃ肠�����\�[�g
    day_list.sort(function(a, b) {
      var at = a.getTime();
      var bt = b.getTime();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    })
    //���߂̓��t���X�V
    var now = new Date();
    for (var i in day_list) {
      if (this.mostRecent == null && now.getTime() < day_list[i].getTime() + 24 * 60 * 60 * 1000) {
        this.mostRecent = day_list[i];
        break;
      }
    };

    this.dayList = day_list;
  }
  /**
   �v�Z�����S�~�̓��ꗗ�����X�g�`���Ƃ��Ď擾���܂��B
  */
  this.getDayList = function() {
    var day_text = "<ul>";
    for (var i in this.dayList) {
      var d = this.dayList[i];
      day_text += "<li>" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + "</li>";
    };
    day_text += "</ul>";
    return day_text;
  }
}
/**
�Z���^�[�̃f�[�^���Ǘ����܂��B
*/
var CenterModel = function(row) {
  function getDay(center, index) {
    var tmp = center[index].split("/");
    return new Date(tmp[0], tmp[1] - 1, tmp[2]);
  }

  this.name = row[0];
  this.startDate = getDay(row, 1);
  this.endDate = getDay(row, 2);
}
/**
* �S�~�̃J�e�S�����Ǘ�����N���X�ł��B
* description.csv�̃��f���ł��B
*/
var DescriptionModel = function(data) {
  this.targets = new Array();

  this.label = data[0];
  this.sublabel = data[1];//not used
  this.description = data[2];//not used
  this.styles = data[3];
  this.background = data[4];

}
/**
 * �S�~�̃J�e�S���̒��̃S�~�̋�̓I�ȃ��X�g���Ǘ�����N���X�ł��B
 * target.csv�̃��f���ł��B
 */
var TargetRowModel = function(data) {
  this.label = data[0];
  this.name = data[1];
  this.notice = data[2];
  this.furigana = data[3];
}

/**
 * �S�~���W���Ɋւ�����l���Ǘ�����N���X�ł��B
 * remarks.csv�̃��f���ł��B
 */
var RemarkModel = function(data) {
  this.id = data[0];
  this.text = data[1];
}

/* var windowHeight; */

$(function() {
/*   windowHeight = $(window).height(); */

  var center_data = new Array();
  var descriptions = new Array();
  var areaModels = new Array();
  var areaGroup = new Object();
  var groupOrder = new Array();
  var remarks = new Array();
/*   var descriptions = new Array(); */


  function getSelectedAreaName() {
    var val = localStorage.getItem("selected_area_name");
    return val ? val : -1;
  }

  function setSelectedAreaName(name) {
    localStorage.setItem("selected_area_name", name);
  }

  function getSelectedGroupName() {
    var val = localStorage.getItem("selected_group_name");
    return val ? val : -1;
  }

  function setSelectedGroupName(name) {
    localStorage.setItem("selected_group_name", name);
  }

  function csvToArray(filename, cb) {
    $.get(filename, function(csvdata) {
      //CSV�̃p�[�X���
      //CR�̉�̓~�X���������ӏ����C�����܂����B
      //�ȑO�̃R�[�h����CR���c�����܂܂ɂȂ�܂��B
      // var csvdata = csvdata.replace("\r/gm", ""),
       csvdata = csvdata.replace(/\r/gm, "");
      var line = csvdata.split("\n"),
          ret = [];
      for (var i in line) {
        //��s�̓X���[����B
        if (line[i].length == 0) continue;

        var row = line[i].split(",");
        ret.push(row);
      }
      cb(ret);
    });
  }

  function updateAreaList() {
    csvToArray("data/area_days.csv", function(tmp) {
      var area_days_label = tmp.shift();
      for (var i in tmp) {
        var row = tmp[i];
        var area = new AreaModel();
        var areas = row[0].split(" ");
        var group_name = areas.shift();
        if (!areaGroup.hasOwnProperty(group_name)) {
            areaGroup[group_name] = new Object();
            groupOrder.push(group_name);
        }
        var group = areaGroup[group_name];
        for (var j in areas) {
            var area_name = areas[j];
            if (area_name == "" || area_name == " ") continue;
            group[area_name] = area;
        }
        area.label = row[0];
        area.centerName = row[1];

        areaModels.push(area);
        //�Q��ڈȍ~�̏���
        for (var r = 2; r < 2 + MaxDescription; r++) {
          if (area_days_label[r]) {
            var trash = new TrashModel(area_days_label[r], row[r], remarks);
            area.trash.push(trash);
          }
        }
      }

      csvToArray("data/center.csv", function(tmp) {
        //�S�~�����Z���^�[�̃f�[�^����͂��܂��B
        //�\����͌���܂��񂪁A
        //����Ȃǂ̊e�����Z���^�[�̋x�~���ԕ��͈�T�Ԃ��炷�Ƃ����@�����̂���
        //�Ⴆ�Α����j���̂Ƃ��́A������炵���̌����������j���ɂ���
        tmp.shift();
        for (var i in tmp) {
          var row = tmp[i];

          var center = new CenterModel(row);
          center_data.push(center);
        }
        //�S�~�����Z���^�[��Ή�����e�n��Ɋ��蓖�Ă܂��B
        for (var i in areaModels) {
          var area = areaModels[i];
          area.setCenter(center_data);
        };

         createSelectBox();

        //�f�o�b�O�p
        if (typeof dump == "function") {
          dump(areaModels);
        }
        //HTML�ւ̓K��
        area_select_form.html(select_html);
        area_select_form.change();
      });
    });
  }

  function createSelectBox () {
    var $select_area = $('#select_area');
    var $select_group = $('#select_group');
    var selected_group = $select_group.val();
    $select_area.hide();
    var options_html = '<option value="-1" selected="selected">���I�����Ă�������</option>';
    for (var i in groupOrder) {
      var group = groupOrder[i];
      options_html += '<option value="' + group + '">' + group + '</option>';
    }
    $select_group.change(function (elem) {
      if ($select_group.val() == -1) {
        $select_area.val(-1);
        $select_area.hide();
        return;
      }
      createAreaSelect();
      $("#accordion").html("");
      $select_area.show();
      $select_area.val(-1);
      $select_area.change();
    });
    $select_group.html(options_html);
    var value = getSelectedGroupName();
    $select_group.val(value);
    createAreaSelect();
    console.log(value);
    if (value != -1) { $select_area.show(); }
    $select_area.val(getSelectedAreaName());
    onChangeSelect(getSelectedGroupName(), getSelectedAreaName());
  }

  function createAreaSelect() {
    var $select_area = $('#select_area');
    var $select_group = $('#select_group');
    var select_html = "";
    var selected_name = getSelectedAreaName();
    select_html += '<option value="-1">�n���I�����Ă�������</option>';
    var group = areaGroup[$select_group.val()];
    for (var area_name in group) {
      var selected = (selected_name == area_name) ? 'selected="selected"': '';
      select_html += '<option value="' + area_name + '" ' + selected + '>' + area_name + '</option>';
    }
    $select_area.html(select_html);
    $select_area.insertAfter($select_group);
    $select_area.val(selected_name);
  }

  function createMenuList(after_action) {
    // ���l�f�[�^��ǂݍ���
    csvToArray("data/remarks.csv", function(data) {
      data.shift();
      for (var i in data) {
        remarks.push(new RemarkModel(data[i]));
      }
    });
    csvToArray("data/description.csv", function(data) {
      data.shift();
      for (var i in data) {
        descriptions.push(new DescriptionModel(data[i]));
      }

      csvToArray("data/target.csv", function(data) {

        data.shift();
        for (var i in data) {
          var row = new TargetRowModel(data[i]);
          for (var j = 0; j < descriptions.length; j++) {
            //��v���Ă���̂ɒǉ�����B
            if (descriptions[j].label == row.label) {
              descriptions[j].targets.push(row);
              break;
            }
          };
        }
        after_action();
        $("#accordion2").show();

      });

    });

  }

  function updateData(row_index) {
    //SVG ���g���邩�ǂ����̔�����s���B
    //TODO Android 2.3�ȉ��ł͌���Ȃ��i��ւ̕\�����܂߁j�s������P����ĂȂ��B�B
    //�Q�l http://satussy.blogspot.jp/2011/12/javascript-svg.html
    var ableSVG = (window.SVGAngle !== void 0);
    //var ableSVG = false;  // SVG���g�p�̏ꍇ�Adescription��1���ږڂ��g�p
    var areaModel = areaModels[row_index];
    var today = new Date();
    //���߂̈�ԋ߂����t���v�Z���܂��B
    areaModel.calcMostRect();
    //�g���b�V���̋߂����Ƀ\�[�g���܂��B
    areaModel.sortTrash();
    var accordion_height = $(window).height() / descriptions.length;
    if(descriptions.length>4){
      accordion_height = accordion_height / 4.1;
      if (accordion_height>140) {accordion_height = accordion_height / descriptions.length;};
      if (accordion_height<130) {accordion_height=130;};
    }
    var styleHTML = "";
    var accordionHTML = "";
    //�A�R�[�f�B�I���̕��ނ���Ή��̌v�Z���s���܂��B
    for (var i in areaModel.trash) {
      var trash = areaModel.trash[i];

      for (var d_no in descriptions) {
        var description = descriptions[d_no];
       if (description.label != trash.label) {
          continue;
        }

          var target_tag = "";
          var furigana = "";
          var target_tag = "";
          var targets = description.targets;
          for (var j in targets) {
            var target = targets[j];
            if (furigana != target.furigana) {
              if (furigana != "") {
                target_tag += "</ul>";
              }

              furigana = target.furigana;

              target_tag += '<h4 class="initials">' + furigana + "</h4>";
              target_tag += "<ul>";
            }

            target_tag += '<li style="list-style:none;"><div>' + target.name + "</div>";
            target_tag += '<div class="note">' + target.notice + "</div></li>";
          }

          target_tag += "</ul>";

          var dateLabel = trash.getDateLabel();
          //���Ɖ��������v�Z���鏈���ł��B
          var leftDayText = "";
	  if (trash.mostRecent === undefined) {
	    leftDayText == "�s��";
	  } else {
            var leftDay = Math.ceil((trash.mostRecent.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

            if (leftDay == 0) {
              leftDayText = "����";
            } else if (leftDay == 1) {
              leftDayText = "����";
            } else if (leftDay == 2) {
              leftDayText = "�����"
            } else {
              leftDayText = leftDay + "����";
            }
	  }

          styleHTML += '#accordion-group' + d_no + '{background-color:  ' + description.background + ';} ';

          accordionHTML +=
            '<div class="accordion-group" id="accordion-group' + d_no + '">' +
            '<div class="accordion-heading">' +
            '<a class="accordion-toggle" style="height:' + accordion_height + 'px" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '">' +
            '<div class="left-day">' + leftDayText + '</div>' +
            '<div class="accordion-table" >';
          if (ableSVG && SVGLabel) {
            accordionHTML += '<img src="' + description.styles + '" alt="' + description.label + '"  />';
          } else {
            accordionHTML += '<p class="text-center">' + description.label + "</p>";
          }
          accordionHTML += "</div>" +
            '<h6><p class="text-left date">' + dateLabel + "</p></h6>" +
            "</a>" +
            "</div>" +
            '<div id="collapse' + i + '" class="accordion-body collapse">' +
            '<div class="accordion-inner">' +
            description.description + "<br />" + target_tag +
            '<div class="targetDays"></div></div>' +
            "</div>" +
            "</div>";
      }
    }

    $("#accordion-style").html('<!-- ' + styleHTML + ' -->');

    var accordion_elm = $("#accordion");
    accordion_elm.html(accordionHTML);

    $('html,body').animate({scrollTop: 0}, 'fast');

    //�A�R�[�f�B�I���̃��x���������N���b�N������
    $(".accordion-body").on("shown.bs.collapse", function() {
      var body = $('body');
      var accordion_offset = $($(this).parent().get(0)).offset().top;
      body.animate({
        scrollTop: accordion_offset
      }, 50);
    });
    //�A�R�[�f�B�I���̔�\���������N���b�N������
    $(".accordion-body").on("hidden.bs.collapse", function() {
      if ($(".in").length == 0) {
        $("html, body").scrollTop(0);
      }
    });
  }

  function onChangeSelect(group_name, area_name) {�@
    if (group_name == -1) {
      setSelectedGroupName(-1);
      $("#accordion").html("");
      return;
    }
    if (area_name == -1) {
      setSelectedAreaName(-1);
      $("#accordion").html("");
      return;
    }
    setSelectedGroupName(group_name);
    setSelectedAreaName(area_name);

    if ($("#accordion").children().length === 0 && descriptions.length === 0) {

      createMenuList(function() {
        updateData(group_name, area_name);
      });
    } else {
      updateData(group_name, area_name);
    }
  }



  function getAreaIndex(area_name) {
    for (var i in areaModels) {
      if (areaModels[i].label == area_name) {
        return i;
      }
    }
    return -1;
  }
  //���X�g���I�����ꂽ��
  $("#select_area").change(function(data) {
    var row_index = $(data.target).val();
    onChangeSelect(row_index);
  });

  //-----------------------------------
  //�ʒu�������Ƃɒn��������I�ɐݒ肷�鏈���ł��B
  //���ꂩ�牺�͌��݁A���p����Ă���܂���B
  //�����I�Ɏg����������Ȃ��̂Ŏc���Ă���܂��B
  $("#gps_area").click(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      $.getJSON("area_candidate.php", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }, function(data) {
        if (data.result == true) {
          var area_name = data.candidate;
          var index = getAreaIndex(area_name);
          $("#select_area").val(index).change();
          alert(area_name + "���ݒ肳��܂���");
        } else {
          alert(data.reason);
        }
      })

    }, function(error) {
      alert(getGpsErrorMessage(error));
    });
  });

  if (getSelectedAreaName() == null) {
    $("#accordion2").show();
    $("#collapseZero").addClass("in");
  }
  if (!navigator.geolocation) {
    $("#gps_area").css("display", "none");
  }

  function getGpsErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "User denied the request for Geolocation."
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable."
      case error.TIMEOUT:
        return "The request to get user location timed out."
      case error.UNKNOWN_ERROR:
      default:
        return "An unknown error occurred."
    }
  }
updateAreaList();
});