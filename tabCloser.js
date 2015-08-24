var TabCloser = function() {

    this.isShowing = false;
 
    this.close = function() {
        var that = this;
        that.isShowing = false;
        var pause = new Date().getTime();
        pause += 15 * 60 * 1000; // 15 min * 60 sec * 1000 ms
        chrome.runtime.sendMessage({pause: pause});
        $('#tabStormDialog').remove();
    }

    this.compareTime = function(ts) {
        var current_ts = new Date().getTime();
        var diff = current_ts - ts;
        var diff_minutes = Math.ceil( diff / (1000 * 60) );
        if (diff_minutes <= 1) {
            return "< 1 minute ago";
        }
        else if (diff_minutes < 60) {
            return diff_minutes + " minutes ago";
        }
        else if (diff_minutes / 60 < 2) {
            return "over 1 hour ago";
        }
        else {
            return "over " + Math.floor(diff_minutes / 60) + " hours ago";
        }
    }

    this.sortCompare = function(tab1, tab2) {
        return tab1.date - tab2.date;
    }

    this.sortTabs = function(tabs) {
        var that = this,
            tab_array;
        tab_array = Object.keys(tabs).map(function (key) {
            return tabs[key];
        });
        tab_array.sort(that.sortCompare);
        return tab_array;
    }

    this.refreshTab = function($tab_li) {
        var that = this;

        var tab_id = $tab_li.data('tab-id');
        if (tab_id)
            chrome.runtime.sendMessage({refresh: true, tab_id: tab_id});
        $tab_li.remove();
    }

    this.removeTab = function($tab_li) {
        var that = this;
        
        var tab_id = $tab_li.data('tab-id');
        if (tab_id)
            chrome.runtime.sendMessage({remove: true, tab_id: tab_id});
        $tab_li.remove();
    }

    this.render = function(tabs) {
        var that = this,
            sorted_tabs,
            $dialog_div, $ul_parent, $li_el;
        if (that.isShowing) {
            return false;
        }
        sorted_tabs = that.sortTabs(tabs);
        
        $dialog_div = $('<div id="tabStormDialog" title="Too many tabs open!"></div>');
        $ul_parent = $('<ul id="tabStormList"></ul>');
        
        for (var i = 0; i < sorted_tabs.length; i++) {
            $li_el = that.renderTab(sorted_tabs[i]);
            $ul_parent.append($li_el);
        }

        $dialog_div.append($ul_parent);
        
        $(document.body).remove('#tabStormDialog'); // Just in case; not strictly necessary
        $(document.body).append($dialog_div);
        $('#tabStormDialog').dialog({
            autoOpen: true,
            width: 500,
            dialogClass: "alert",
            close: function() {
                that.close();
            }
          });
        that.isShowing = true;
    }
    
    this.renderTab = function(tab) {
        var that = this,
            inner_div_html, timestamp_html,
            $close_button, $check_button,
            $div_el, $inner_div, $li_el;
        
        $close_button = $('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close" role="button" title="x"><span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span></button>');
        
        $check_button = $close_button.clone();
        $check_button
            .addClass('check_button')
            .find('span')
            .removeClass('ui-icon-closethick')
            .addClass('ui-icon-check');

        $check_button.on('click', function() {
            that.refreshTab($(this).closest('li'));
        });
        $close_button.on('click', function() {
            that.removeTab($(this).closest('li'));
        });
        
        $li_el = $('<li data-tab-id=' +  tab.id + '></li>');
        $div_el = $('<div class="ui-state-default ui-widget ui-corner-all ui-helper-clearfix"></div>');
        inner_div_html = '<div style="display:inline;"><b>' +
            tab.title.substring(0, 35) +
            '</b><br/>' +
            tab.url.substring(0, 45);
        timestamp_html = '<span class="timestamp">' +
            that.compareTime(tab.date) + 
            '</span>';
        
        $div_el
            .append(inner_div_html)
            .append(timestamp_html)
            .append($check_button)
            .append($close_button);
               
        $li_el.append($div_el);
        return $li_el;    
    }
}

var closer = new TabCloser();

chrome.runtime.onMessage.addListener(
  function(request, sender, callback) {
    if (request.display) {
      closer.render(request.tabs);
    }
  }
);
