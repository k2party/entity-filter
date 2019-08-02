(function($) {
	var EntityFilter = function($target, options) {
		this._$target = $target;
		this._options = $.extend({
			matchAll: true,
			entity: '.entity',
			entity_none: '.entity_none',
			filters: {},
			matches: {},
			matchesDefault: true, // "match"
			delimiter: /[　,\s]/,
		}, options);
	};
	
	EntityFilter.prototype = {
		_getMatchAll: function() {
			var result = this._options.matchAll;
			if(result == undefined) {
				result = true;
			}
			return result? 'every':'some';
		},
		
		_getMatchingType: function(name) {
			var result = this._options.matches[name];
			if(result == undefined) {
				result = this._options.matchesDefault;
			}
			if(typeof result == 'bool') {
				result = result? 'match':'partical';
			}
			return result;
		},
		
		_getFilters: function() {
			var filters = {};
			for(var name in this._options.filters) {
				var value = this._options.filters[name];
				if(value == null || value == undefined) continue;
	
				value = value.trim();
				if(value.length == 0) continue;
	
				filters[name] = value;
			};
			return filters;
		},
		
		_getEntities: function() {
			return this._$target.find(this._options.entity);
		},

		_showEntityNone: function() {
			var _ef = this;
			this._$target.each(function(index, target) {
				var $target = $(target);
				var $visible = $target.find(_ef._options.entity +':visible');
				if($visible.length == 0) {
					$target.find(_ef._options.entity_none).show();
				}
				else {
					$target.find(_ef._options.entity_none).hide();
				}
			});
		},
		
		_split: function(value, delimiter) {
			if(delimiter == undefined) {
				delimiter = this._options.delimiter;
			}
			return value.split(delimiter)
			.filter(function(value) {
				return (value.trim().length > 0);
			});
		},
		
		_matching: function(type, text, value)
		{
			switch(type) {
			case 'match':
				return (text == value);
			case 'or':
				return this._split(value).some(function(needle) {
					return (text.indexOf(needle) > -1);
				});
			case 'and':
				return this._split(value).every(function(needle) {
					return (text.indexOf(needle) > -1);
				});
			case 'partical':
				return (text.indexOf(value) > -1);
			case 'prefix':
				return text.startsWith(value);
			case 'suffix':
				return text.endsWith(value);
			default:
				$.error('unknown type:' + type);
			}
			return false;
		},
		
		_filter: function(filters) {
			var _ef = this;
			this._getEntities().each(function(index, entity) {
				var $entity = $(entity);
				var visible = Array.prototype[_ef._getMatchAll()]
				.call(Object.keys(filters), function(name) {
					var value = filters[name];
					var text = $entity.text();
					if(name != '_') {
						text = $entity.find('.' + name).text();
					}
					
					var type = _ef._getMatchingType(name);
					return _ef._matching(type, text, value);
				});
	
				if(visible) {
					$entity.show();
				}
				else {
					$entity.hide();
				}
			});
		},
		
		show: function() {
			this._getEntities().show();
			this._showEntityNone();
			return this;
		},
	
		hide: function() {
			this._getEntities().hide();
			this._showEntityNone();
			return this;
		},
	
		filter: function() {
			var filters = this._getFilters();
			if(Object.keys(filters).length == 0) {
				return this.show();
			}
	
			this._filter(filters);
			this._showEntityNone();
			return this;
		},
		
		set: function() {
			var args = Array.prototype.slice.apply(arguments);
			var name = '_';
			if(args.length > 1) {
				name = args.shift();
			}
			this._options.filters[name] = args[0];
			return this;
		},
		
		__get: function() {
			var args = Array.prototype.slice.apply(arguments);
			var name = '_';
			if(args.length > 0) {
				name = args.shift();
			}
			
			return this._options.filters[name];
		},
	
		__options: function() {
			return this._options;
		},
		
		__filters: function() {
			return this._getFilters();
		},
		
		__entities: function() {
			return this._getEntities();
		},
	};
	
	jQuery.fn.EntityFilter = function() {
		var args = Array.prototype.slice.call(arguments);
	
		if(args.length == 0 || typeof args[0] == 'object') {
			this.each(function(index, target) {
				target._entity_filter = new EntityFilter($(target), args[0]);
			});
			
			return this;
		}
		
		var cmd = args.shift();
		if(cmd.charAt(0) != '_' && typeof EntityFilter.prototype[cmd] == 'function') {
			this.each(function(index, target) {
				EntityFilter.prototype[cmd].apply(target._entity_filter, args);
			});
			return this;
		}
		
		if(typeof EntityFilter.prototype['__' + cmd] == 'function') {
			var results = this.map(function(index, target) {
				return EntityFilter.prototype['__' + cmd].apply(target._entity_filter, args);
			});
			return (results.length > 1)? results:results[0];
		}
	
		$.error('EntityFilter: command "{cmd}" does not exist.'.replace('{cmd}', cmd));
	};
})(jQuery);
