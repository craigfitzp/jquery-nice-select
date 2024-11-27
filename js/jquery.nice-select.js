/*  jQuery Nice Select - v1.1.0
    https://github.com/hernansartorio/jquery-nice-select
    Made by Hernán Sartorio

    Fork by DTMG v1.1.3
*/

(function($) {

    $.fn.niceSelect = function(method) {

        // Methods
        if (typeof method == 'string') {
            if (method == 'update') {
                this.each(function() {
                    let $select = $(this);
                    let $dropdown = $(this).next('.nice-select');
                    let open = $dropdown.hasClass('open');

                    if ($dropdown.length) {
                        $dropdown.remove();
                        create_nice_select($select);

                        if (open) {
                            $select.next().trigger('click');
                        }
                    }
                });
            } else if (method == 'destroy') {
                this.each(function() {
                    let $select = $(this);
                    let $dropdown = $(this).next('.nice-select');

                    if ($dropdown.length) {
                        $dropdown.remove();
                        $select.css('display', '');
                    }
                });

                if ($('.nice-select').length == 0) {
                    $(document).off('.nice_select');
                }
            } else {
                console.log('Method "' + method + '" does not exist.');
            }

            return this;
        }

        // Hide native select
        this.hide();

        // Create custom markup
        this.each(function() {
            let $select = $(this);

            if (!$select.next().hasClass('nice-select')) {
                create_nice_select($select);
            }
        });

        function create_nice_select($select) {
            let $no_input = $select.hasClass("no-input");

            $select.after($('<div></div>')
                .addClass('nice-select')
                .addClass($select.attr('class') || '')
                .addClass($select.attr('disabled') ? 'disabled' : '')
                .attr('tabindex', $select.attr('disabled') ? null : '0')
                .html((!$no_input ? '<input type="text" value="" class="current">' : '<span class="current"></span>')+'<ul class="list"></ul>')
            );

            let $dropdown = $select.next();
            let $options = $select.find('option');
            let $selected = $select.find('option:selected');
            let $display = $selected.data('display');
            let $text = $selected.text();

            if ($display) {
                if ($no_input) {
                    $dropdown.find('.current').text($display.trim());
                } else {
                    $dropdown.find('.current').attr("placeholder", $display.trim());
                }
            } else if ($text) {
                if ($no_input) {
                    $dropdown.find('.current').text($text.trim());
                } else {
                    $dropdown.find('.current').attr("placeholder", $text.trim());
                }
            }

            $options.each(function(i) {
                let $option = $(this);
                let display = $option.data('display');
                let style = $option.attr('style');

                $dropdown.find('ul').append($('<li'+(style ? ' style="'+style+'"' : '')+'></li>')
                    .attr('data-value', $option.val())
                    .attr('data-search', $option.val().toLowerCase())
                    .attr('data-display', (display || null))
                    .addClass('option' +
                    ($option.is(':selected') ? ' selected' : '') +
                    ($option.is(':disabled') ? ' disabled' : ''))
                    .html($option.text())
                );
            });
        }

        /* Event listeners */

        // Unbind existing events in case that the plugin has been initialized before
        $(document).off('.nice_select');

        // Open/close
        $(document).on('click.nice_select', '.nice-select', function(event) {
            let $dropdown = $(this);

            $('.nice-select').not($dropdown).removeClass('open');
            $dropdown.toggleClass('open');

            if ($dropdown.hasClass('open')) {
                $dropdown.find('.option');
                $dropdown.find('.focus').removeClass('focus');
                $dropdown.find('.selected').addClass('focus');
            } else {
                $dropdown.focus();
            }
        });

        // Close when clicking outside
        $(document).on('click.nice_select', function(event) {
            if ($(event.target).closest('.nice-select').length === 0) {
                $('.nice-select').removeClass('open').find('.option');
            }
        });

        $(document).on("keyup", ".nice-select .current", function(){
            let $this = $(this);
            let $value = $this.val().toLowerCase();
            let $list = $this.parent();

            if ($value) {
                $list.find("li:gt(0)").hide();
                $list.find("li[data-search*='"+$value+"']").show();
                $list.find("li:icontains('"+$value+"')").show();
            } else {
                $list.find("li").show();
            }
        });

        // Option click
        $(document).on('click.nice_select', '.nice-select .option:not(.disabled)', function(event) {
            let $option = $(this);
            let $dropdown = $option.closest('.nice-select');
            let $display = $option.data('display');
            let $text = $option.text();

            $dropdown.find('.selected').removeClass('selected');
            $option.addClass('selected');

            if ($display) {
                $dropdown.find('.current').attr("placeholder", $display.trim());
            } else if ($text) {
                $dropdown.find('.current').attr("placeholder", $text.trim());
            }

            $dropdown.prev('select').val($option.data('value')).trigger('change');
        });

        // Keyboard events
        $(document).on('keydown.nice_select', '.nice-select', function(event) {
            let $dropdown = $(this);
            let $focused_option = $($dropdown.find('.focus') || $dropdown.find('.list .option.selected'));

            // Space or Enter
            if (event.keyCode == 32 || event.keyCode == 13) {
                if ($dropdown.hasClass('open')) {
                    $focused_option.trigger('click');
                } else {
                    $dropdown.trigger('click');
                }

                return false;

            // Down
            } else if (event.keyCode == 40) {
                if (!$dropdown.hasClass('open')) {
                    $dropdown.trigger('click');
                } else {
                    let $next = $focused_option.nextAll('.option:not(.disabled)').first();

                    if ($next.length > 0) {
                        $dropdown.find('.focus').removeClass('focus');
                        $next.addClass('focus');
                    }
                }

                return false;

            // Up
            } else if (event.keyCode == 38) {
                if (!$dropdown.hasClass('open')) {
                    $dropdown.trigger('click');
                } else {
                    let $prev = $focused_option.prevAll('.option:not(.disabled)').first();

                    if ($prev.length > 0) {
                        $dropdown.find('.focus').removeClass('focus');
                        $prev.addClass('focus');
                    }
                }

                return false;

            // Esc
            } else if (event.keyCode == 27) {
                if ($dropdown.hasClass('open')) {
                    $dropdown.trigger('click');
                }

            // Tab
            } else if (event.keyCode == 9) {
                if ($dropdown.hasClass('open')) {
                    return false;
                }
            }
        });

        // Detect CSS pointer-events support, for IE <= 10. From Modernizr.
        let style = document.createElement('a').style;
        style.cssText = 'pointer-events:auto';
        if (style.pointerEvents !== 'auto') {
            $('html').addClass('no-csspointerevents');
        }

        return this;

    };

    jQuery.expr[':'].icontains = function(a, i, m) {
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

}(jQuery));