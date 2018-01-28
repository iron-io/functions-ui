<template>
  <modal title="Run Function" :show="show" @closed="closed" @ok="ok" @cancel="closed">
    <form class="form-horizontal" v-on:submit.prevent="ok">
      <div class="form-group">
        <label class="col-sm-3 control-label">App</label>
        <div class="col-sm-9">
          <input type="text" class="form-control" v-model="app.name" disabled>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label">Route</label>
        <div class="col-sm-9">
          <input type="text" class="form-control" v-model="route.path" disabled>
        </div>
      </div>
      <div class="form-group" v-if="route.jwt_key">
        <label class="col-sm-3 control-label">Jwt Key</label>
        <div class="col-sm-9">
          <input type="text" class="form-control" v-model="route.jwt_key" disabled>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label">Payload</label>
        <div class="col-sm-9">
          <textarea class="form-control" v-model="payload" placeholder="e.g. {}" v-on:change="calculateToken"></textarea>
        </div>
      </div>
      <div v-if="!route.jwt_key">
        <h5>cURL command</h5>
        <pre>curl -X POST -d '{{payload}}' {{apiUrl}}r/{{fmtStr(this.app.name)}}{{fmtStr(this.route.path)}}</pre>
      </div>
      <div v-if="route.jwt_key">
        <h5>cURL command</h5>
        <pre>curl -X POST -H 'Authorization: Bearer {{authToken}}' -d '{{payload}}' {{apiUrl}}r/{{fmtStr(this.app.name)}}{{fmtStr(this.route.path)}}</pre>
      </div>

      <div v-show="output">
        <h5>Output</h5>
        <pre>{{output}}</pre>
      </div>
    </form>

    <div slot="footer">
      <button type="button" class="btn btn-primary" @click="ok" :disabled="submitting">Run</button>
    </div>
  </modal>
</template>

<script>
import Modal from '../lib/VueBootstrapModal.vue';
import { eventBus } from '../client';
import { defaultErrorHandler, getApiUrl } from '../lib/helpers';
const jwt = require('jsonwebtoken');

export default {
  props: ['app'],
  components: {
    Modal
  },
  data: function(){
    return {
      route: {},
      show: false,
      submitting: false,
      payload: '{}',
      authToken: null,
      output: null,
      apiUrl: ''
    }
  },
  methods: {
    closed: function(){
      this.show = false;
    },
    fmtStr: function(str){
      return encodeURI(str);
    },
    ok: function(){
      var t = this;
      this.output = null;
      eventBus.$emit('NotificationClear');
      this.submitting = true;

      $.ajax({
        url: '/api/apps/' + encodeURIComponent(this.app.name) + '/routes/' + encodeURIComponent(this.route.path) + '/run',
        method: 'POST',
        data: JSON.stringify({payload: this.payload}),
        contentType: "application/json",
        headers: {
          'X-Jwt-Key': this.route.jwt_key
        },
        dataType: 'json',
        success: (res) => {
          console.log("res", res);
          t.submitting = false;
          t.output = res.output;
          //t.closed();
        },
        error: function(jqXHR, textStatus, errorThrown){
          t.submitting = false;
          defaultErrorHandler(jqXHR);
        }
      })
    },
    calculateToken: function() {
      this.authToken = jwt.sign(this.payload, this.route.jwt_key);
    },
  },
  created:  function (){
    var t = this;
    eventBus.$on('openRunFunction', (route) => {
      this.route = route;
      this.payload = '{}';
      this.output = null;
      this.show = true;
      if(this.route.jwt_key) {
        this.calculateToken();
      }
    });
    eventBus.$on('calculateToken', () => {
      this.calculateToken();
    });
    getApiUrl( url => t.apiUrl = url );
  }
}
</script>

<style scoped>
</style>