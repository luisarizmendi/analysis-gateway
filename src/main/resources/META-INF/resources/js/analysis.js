    const appvalues = document.querySelector('#appvalues');
    const streamUrl = appvalues.dataset.streamUrl;


    /* Hide indicators until patient info is intruduced and after sending */
    if(document.cookie.indexOf('patient_id') == -1){
        $('#indicator_form').hide();
    }
        $("#patient_entered").click(function(){
          //$('#indicator_form').show();
          window.location.href = "#new";
        });  

    /* Display the modal popup with selected data */
    $('#myModal').on('show.bs.modal', function (event) {

        // hide the alert for successfully adding an item
        $('#item_added_alert').hide();

        var button = $(event.relatedTarget)
        var item = button.data('whatever')
        var item_display_name = button.data('display_name');
        var item_type = button.data('item_type');
        var modal = $(this);
        //        modal.find('.modal-body inplut').val(recipient)
        modal.find('#item_label').text(item_display_name);
        modal.find('#item').val(item);
        modal.find('#item_type').val(item_type);
        displayCurrentOrder();
    });

    /* Display the current order */
    function displayCurrentOrder(){

        // clear out the list to start fresh
        $('#current_order').empty();

        // get the current order
        let regular = $('#order_form').find('input[name="regular"]').serializeArray();
        let virus = $('#order_form').find('input[name="virus"]').serializeArray();
        let current_items = regular.concat(virus);

        if(current_items.length >= 1){
            current_items.forEach(function(e){
                console.log(e);
                let order = JSON.parse(e.value);
                console.log(order);
                $('#current_order').append('<li class="borderless input-analysis">'+ displayFriendlyItem(order.item) + ' for ' + order.name + '</li>');
            });
        }
    }

    /* Update the current order after a new item is added */
    function updateCurrentOrder(item, name){
        let new_line = $('<li class="borderless input-analysis">'+ displayFriendlyItem(item) + ' for ' + name + '</li>')
            .fadeIn(500);
        $('#current_order')
            .append(new_line);
    }

    /* Modal popup - add item to the order*/
    $('#item_form').submit(function( event ) {

        let item_type = $('#item_form').find('input[name="item_type"]').val();
        let item = $('#item_form').find('input[name="item"]').val();
        //let name = $('#item_form').find('input[name="name"]').val();
        let name = $('#patient_id').val();

        let item_to_add = { 'item' : item, 'name': name};

        if(item_type == 'regular'){
            console.log('adding regular');
            let regular = $('#order_form').find('input[name="regular"]').serializeArray();
            if(regular.length === 0){
                $('<input>').attr({
                    type: 'hidden',
                    id: 'regular-0',
                    name: 'regular',
                    value: JSON.stringify(item_to_add)
                }).appendTo('form');
            }else if(regular.length >= 1){
                $('<input>').attr({
                    type: 'hidden',
                    id: 'regular-' + regular.length++,
                    name: 'regular',
                    value: JSON.stringify(item_to_add)
                }).appendTo('form');
            }
            console.log('added');

        }else if(item_type == 'virus'){
            console.log('adding virus item');
            var virus = $('#order_form').find('input[name="virus"]').serializeArray();
            if(virus.length === 0){
                $('<input>').attr({
                    type: 'hidden',
                    id: 'virus-0',
                    name: 'virus',
                    value: JSON.stringify(item_to_add)
                }).appendTo('form');
            }else if(virus.length >= 1){
                $('<input>').attr({
                    type: 'hidden',
                    id: 'kithen-' + virus.length++,
                    name: 'virus',
                    value: JSON.stringify(item_to_add)
                }).appendTo('form');
            }
            console.log('added');
        }

        // display the alert for successfully adding an item
        $('#item_added_alert').text(displayFriendlyItem(item) + ' for ' + name + ' added to order.').show();
        setTimeout(function(){
            updateCurrentOrder(item, name);
        }, 1000);
        setTimeout(function(){
            $('#item_added_alert').fadeOut(1000);
        }, 1000);

        event.preventDefault();
    });

    /* Modal popup - submit order */
    $("#order_form").submit(function(event){

  //      document.cookie = "patient_id= ; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
  //      $('#indicator_form').hide();
  //      window.location.href = "#statusboard";


        console.log("order submitted");
        let regular = $('#order_form').find('input[name="regular"]').map(function(){
            return JSON.parse($(this).val());
        }).get();
        let virus = $('#order_form').find('input[name="virus"]').map(function(){
            return JSON.parse($(this).val());
        }).get();

        // if the user clicks "Place Order" before "Add"
        if((regular === undefined || regular.length == 0 ) && (virus === undefined || virus.length == 0)){

            let item_type = $('#item_form').find('input[name="item_type"]').val();
            let item = $('#item_form').find('input[name="item"]').val();
            //let name = $('#item_form').find('input[name="name"]').val();
            let name = $('#patient_id').val();
            let item_to_add = { 'name': name, 'item': item};

            if(item_type == 'regular'){
                console.log('adding regular marker');
                regular.push(item_to_add);
            }else if(item_type == 'virus'){
                console.log('adding virus marker');
                virus.push(item_to_add);
            }

        }

        let patient_id = $('#patient_id').val();

        let order = {};
        order.id = uuidv4();
        order.patientId = patient_id;
        order.regularLineItems = [];
        order.virusLineItems = []


        if(regular.length >= 1){
            for (i = 0; i < regular.length; i++) {
                console.log(regular[i]);
                order.regularLineItems.push(regular[i]);
            }
        }
        if(virus.length >= 1){
            for (i = 0; i < virus.length; i++) {
                console.log(virus[i]);
                order.virusLineItems.push(virus[i]);
            }
        }

        console.log("Sending order from web client: " + JSON.stringify(order));
      

        var jqxhr = $.ajax({
            beforeSend: function(xhrObj){
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Accept","application/json");
            },
            type: "POST",
            url: "/order",
            data: JSON.stringify(order),
            success: function(){ console.log('success for ' + JSON.stringify(order)); },
            contentType: 'application/json',
            dataType: 'json'
        })
            .done(function() {
                console.log( "done" );
                $('#order_form').find('input[name="regular"]').map(function () {
                    $(this).remove();
                })
                $('#order_form').find('input[name="virus"]').map(function () {
                    $(this).remove();
                })
            })
            .fail(function(jqxhr, errorStatus, errorThrown) {
                console.log( "error : " + errorThrown + " " + errorStatus);
            })
            .always(function() {
                console.log( "finished" );
            });


            document.cookie = "patient_id= ; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
            $('#indicator_form').hide();
            window.location.href = "#statusboard";

        // close the modal
        $('#myModal').modal('toggle');

        // prevent form submission
        event.preventDefault();


    });

    function mapToObjectRec(m) {
        let lo = {}
        for(let[k,v] of m) {
            if(v instanceof Map) {
                lo[k] = mapToObjectRec(v)
            }
            else {
                lo[k] = v
            }
        }
        return lo
    }

    // create a uuid for the order id
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Status Board
    $(function () {

        var source = new EventSource(streamUrl);
        source.onmessage = function(e) {
            console.log(e);
            var state = JSON.parse(e.data);
            if(state.status=="IN_PROGRESS")
                $("tbody").append(line(state));
            if(state.status=="FULFILLED"){40
                console.log(state);
//              $("#"+state.itemId).replaceWith(line(state));
//                setTimeout(cleanup(state.itemId), 60000);
                display(state);
            }
        };      

    });

    function display(state){
        let count = (Math.floor(Math.random() * 15) * 1000) + 5000;
        console.log(count);
        $("#"+state.itemId).replaceWith(line(state));
        setTimeout(function(){ $("#"+state.itemId).remove(); }, count);
    }

    function cleanup(itemid){
        console.log("time to cleanup" + itemid);
//      $("#"+itemid).remove();
    }

    function line(state) {
        var orderId = state.orderId;
        var id = state.itemId;
        var product = state.item;
        var customer = state.name;
        var status = state.status;
        var preparedBy = state.madeBy;
        /*
          if (state.item) {
              regular = state.item.preparedBy;
          }
        */
        return "<tr id='" + id + "'>" +
            "<td>" + customer + "</td>" +
            "<td>" + displayFriendlyItem(product) + "</td>" +
            "<td>" + displayFriendlyStatus(status) + "</td>" +
            "<td>" + displayFriendlyPreparedBy(preparedBy) + "</td></tr>";
    }

    /* Display friendly prepared by or nothing */
    function displayFriendlyPreparedBy(value){
        return value === undefined ? ""
            : value === null ? ""
            : value === 'null' ? ""
            : value;
    }

    /* Display friendly product names
    */
    function displayFriendlyItem(item){
        let result;

        switch(item){
            case "COVID-19":
                console.log("COVID-19");
                result = "COVID-19"
                break;
            case "SODIUM":
                console.log("Sodium");
                result = "Sodium";
                break;
            case "POTASSIUM":
                console.log("Potassium");
                result = "Potassium";
                break;
            case "CHOLESTEROL":
                console.log("Cholesterol");
                result = "Cholesterol";
                break;
            case "VITAMINB12":
                console.log("Vitamin b12");
                result = "Vitamin b12";
                break;
            case "HEMOGLOBIN":
                console.log("Hemoglobin");
                result = "Hemoglobin";
                break;
            case "AIDS":
                console.log("AIDS");
                result = "AIDS";
                break;
            case "PLATELET":
                console.log("Platelet count");
                result = "Platelet count";
                break;
            case "TRIGLYCERIDES":
                console.log("Triglycerides");
                result = "Triglycerides";
                break;
            // default to the returned value
            default:
                result = item;
                console.log(item);
        }
        return result;
    }

    function displayFriendlyStatus(status){
        let result;
        switch(status){
            case "IN_PROGRESS":
                console.log("In progress");
                result = "In progress";
                break;
            case "FULFILLED":
                console.log("Ready!");
                result = "Ready";
                break;
            default:
                result = status;
        }
        return result;
    }


    $('#patient_modal').on('submit', function() {

        let patient_id = $('#patient_id').val();
        console.log("patient id entered: " + patient_id);
        $('#patient_display_id').text(patient_id);
        $.cookie('patient_id',patient_id, 10);
        $('#btn_cancel').click();
    });

    $('#patientModal').on('shown.bs.modal', function() {
        $('#patient_id').focus();
    });

    $( document ).ready(function() {
        let patient_name = $.cookie('patient_id');

        if (patient_name === undefined){
            //nothing
        }else{
            $('#patient_id').val(patient_name);
            $('#patient_display_id').text(patient_name);
        }
    });
