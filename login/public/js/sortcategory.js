
		var category = [];
		var $category = $("table.catsortable");
		var container = $("#category");
		// this is the only specific case, as the date does not start by the year
		// it will be used to sort by publish date
		function sortByDate(a, b) {
		    return new Date(a.publish).getTime() - new Date(b.publish).getTime();
		}

		function sortcategory(order) {
		    var sort;
		    if (order === "publish") {
		        category = category.sort(sortByDate);
		    } else {
		        category = category.sort(function(a, b) {
		            return a[order] < b[order] ? -1 : 1;
		        });
		    }
		    category.forEach(function(data,i) {
		        category[i].$el.detach();
		        container.append(category[i].el);
		    });
		}

		function initcat() {
		    //populate the category array that will be sorted
		    $category.each(function(i, val) {
		        var $this = $(this);
		        category.push({
		            $el: $this,
		            el: this,
		            catname: $this.find(".catname").text()
		            //character: $this.find(".character").text(),
		            //hero: $this.find(".hero").text(),
		            //publish: $this.find(".publish").text()
		        });
		    });
		    /*$("#OrderBy").on("change", function(event) {
		        sortcategory(event.currentTarget.value);
		    });*/
		    //by default sort by Catname
		    sortcategory("catname");
		}
		//init();