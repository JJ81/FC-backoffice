/**
 * Created by yijaejun on 30/11/2016.
 * TODO
 * locale 적용이 안되는 문제. (관련항목 : moment_ko) 
 */
'use strict';
requirejs(
	[
		// 'jquery',
		// 'axios',		
        // 'moment',
        'common',
		// 'bootstrap',        
        // 'bootstrap_datetimepicker',
		// 'jquery_ui',
		// 'excellentExport',
		// 'bootstrap',
		// 'jquery_datatable',
		// 'bootstrap_datatable',
        // 'responsive_datatable',  
		// 'select2',
		// 'adminLTE',
		// 'fastclick',		
        // 'es6-promise',
	],
	function (Util) {

		// avoid to confliction between jquery tooltip and bootstrap tooltip
		// $.widget.bridge('uibutton', $.ui.button);
        // https://github.com/stefanpenner/es6-promise 참고
        // require('es6-promise').polyfill();        

		// todo 교육과정 생성하기를 눌렀을 경우 group_id를 발급받아서 input에 저장한다.
		// 선택한 강의에 대해서 강의 번호를 배열에 담아 놓고 서버로 전달한다
		// group_id를 통해서 선택한 강의를 테이블에 저장하고,
		// course 테이블에 교육명과 교육설명 등을 저정한다

		var _btn_add_course = $('.btn-add-course-edu'),
		    _select_course_list = $('#select-course-list'),
		    _course_group_id = $('.course_group_id'),
		    _course_container = $('#draggablePanelList'),
            _btn_create_edu = $('.btn-register-course-submit'),
            _courseName = $('.course-name'),
		    _courseDesc = $('.course-desc');

        $(function () {

            // DateTimePicker 설정
            var start_dt = moment().format();
            var end_dt = moment().add(6, 'days');

            // 교육 시작일자
            $('#start_dt').datetimepicker({
                defaultDate: start_dt,
                format: 'YYYY-MM-DD',
                showTodayButton: true
            });

            // 교육 종료일자
            $('#end_dt').datetimepicker({
                defaultDate: end_dt,
                format: 'YYYY-MM-DD',
                useCurrent: false,
                showTodayButton: true
            });

            // 날짜가 서로 겹치지 않도록 설정한다.
            $("#start_dt").on("dp.change", function (e) {
                $('#end_dt').data("DateTimePicker").minDate(e.date);
            });
            $("#end_dt").on("dp.change", function (e) {
                $('#start_dt').data("DateTimePicker").maxDate(e.date);
            });

            // datatable 설정
            Util.initDataTable($('#table_education'));

            // jQuery UI sortable 초기화
            $('#draggablePanelList').sortable({
                placeholder: "sort-highlight",
                handle: ".handle",
                forcePlaceholderSize: true,
                zIndex: 999999,
                start: function(e, ui) {
                    $(this).attr('data-previndex', ui.item.index());
                },
                update: function(e, ui) {
                    var newIndex = ui.item.index();
                    var oldIndex = $(this).attr('data-previndex');
                    $(this).removeAttr('data-previndex');
                    console.log('newIndex : ' + newIndex + ' oldIndex : ' + oldIndex);
                }
            });
              
        });

        // 강의 추가
        _btn_add_course.bind('click', function () {        
            addCourseGroupItem();
        });        

        // 강의를 그룹에 추가한다.
        function addCourseGroupItem () {

            var course_id = _select_course_list.find('option:selected').val();
			var course_name = _select_course_list.find('option:selected').text();
            var element = "";

            // 강의 중복추가 방지
            var duplicated_item = $('.list-group-item[data-course-id="' + course_id + '" ]');
            if (duplicated_item.length) {
                duplicated_item.show();
                return false;
            }

            element += '<li class="list-group-item" data-course-id="' + course_id + '">';
            element += '    <div class="course">';
            element += '        <span class="handle ui-sortable-handle">';
            element += '            <i class="fa fa-ellipsis-v"></i>';
            element += '            <i class="fa fa-ellipsis-v"></i>';
            element += '        </span>';                 
            element += course_name;
            element += '        <a href="#" class="btn-delete-course">';
            element += '            <i class="fa fa-remove text-red"></i>';
            element += '        </a>';
            element += '    </div>';
            element += '</li>';

            _course_container.append(element);

        }

        /**
         * 동적으로 추가된 강의에 이벤트 바인딩
         */
        _course_container.on('click', '> li', function (e) {
            deleteEduCourse($(e.target).parent().parent().parent());
        });        

        // 강의 삭제
        $('.btn-delete-course').bind('click', function () {
            deleteEduCourse($(this).parent().parent());
        });

        function deleteEduCourse (course) {
            course.remove();
        }

        // 강의그룹 데이터를 생성한다.
        function makeCourseGroupList () {

            var course_group_list = [];
            var order = 0;
            var mode = "";
            var valid_course_count = 0; 

            $('#draggablePanelList').find('li.list-group-item').each(function (index) { 
                
                var course_group = {
                    course_id: $(this).data('course-id'),
                    order: order
                };

                if (course_group.id)
                    if ($(this).is(":visible")) 
                        course_group.mode = "UPDATE";
                    else
                        course_group.mode = "DELETE";
                else
                    course_group.mode = "INSERT";
                
                course_group_list.push(course_group);

                if (course_group.mode !== "DELETE") {
                    valid_course_count += 1;
                    order += 1;
                }

            });

            return { data: course_group_list, valid_course_count: valid_course_count };
            
        }        

        // 교육과정 등록
        _btn_create_edu.bind('click', function (e) {

            e.preventDefault();

            var modal = $('#frm_register_edu'),
                edu_name = $('.course-name'),
                edu_desc = $('.course-desc'),                        
                course_group_list = makeCourseGroupList();

			if (edu_name.val() === ''){
				alert('교육과정명을 입력하세요.');
				edu_name.focus();
				return false;
			}

			if (edu_desc.val() === ''){
				alert('교육과정 소개를 입력해주세요.');
				edu_desc.focus();
				return false;
			}

            if (!course_group_list.valid_course_count) {
                alert('강의를 추가해주세요.');
                return false;
            }

            if (!confirm("등록하시겠습니까?"))
                return false;

            // 저장한다.
			axios({
				method : 'post',
				url: '/education/create/edu',
				data : {
					name : edu_name.val().trim(),
					desc : edu_desc.val().trim(),
					course_group_list : course_group_list.data,
                    start_dt: $('#start_dt').find("input").val() + ' ' + '00:00:00',
                    end_dt: $('#end_dt').find("input").val() + ' ' + '23:59:59'
				}
			}).then(function (res){
				if(res.data.success == true){
					alert('교육과정을 등록하였습니다.');
				}else{
					alert('알 수 없는 오류가 발생했습니다. 잠시 후에 다시 시도해주세요.');
				}

				window.location.reload();
			});
        });

	}); // end of func