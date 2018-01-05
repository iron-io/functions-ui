<template>
  <div>
    <ol class="breadcrumb">
      <li><router-link to="/">Apps</router-link>      </li>
      <li class="active">{{app.name}}</li>
    </ol>
    <br />


    <h1 class="page-header">
      {{app.name}}

      <div class="pull-right">
        <button class="btn btn-default" @click="openAddRoute()"><i class="fa fa-plus"></i> Add Route</button>
      </div>
    </h1>

    <br />

    <!-- <div class="table-responsive"> -->
    <div class="row">
      <div class="col-md-12 col-lg-10">
        <table class="table table-striped">
          <thead v-bind:class="{ transparent: routes.length == 0 }">
            <th>Path</th>
            <th>Image</th>
            <th>Type</th>
            <th>Memory</th>
            <th>MaxCC</th>
            <th>Timeout</th>
            <th>Idle Timeout</th>
            <th width="140">Actions</th>
          </thead>
          <tbody>
            <tr v-for="route in routes">
              <td>{{route.path}}</td>
              <td>{{route.image}}</td>
              <td>{{route.type}}</td>
              <td>{{route.memory}} MB</td>
              <td>{{route.max_concurrency}}</td>
              <td>{{route.timeout}}</td>
              <td>{{route.idle_timeout}}</td>
              <td>
                <div class="toolbar">

                  <div class="btn-group">
                    <button class="btn btn-default btn-sm" @click.prevent="openRunFunction(route)" title="Run Function"><i class="fa fa-play"></i> Run Function</button>
                    <button type="button" class="btn btn-default dropdown-toggle btn-sm" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <span class="caret"></span>
                      <span class="sr-only">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right">
                      <li>
                        <a href="#" @click.prevent="openEditRoute(route)" title="Edit Route">
                          <i class="fa fa-gear"></i> Edit Route
                        </a>
                        <a href="#" @click.prevent="deleteRoute(route)"
                        class="text-danger" title="Delete Route">
                          <i class="fa fa-times"></i> Delete Route
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="routesLoaded && routes.length == 0">
              <td colspan="99" class="no-matches">
                <div>
                  No Routes
                </div>
              </td>
            </tr>
            <tr v-if="!routesLoaded">
              <td colspan="99" class="no-matches">
                <div>Loading...</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <fn-route-form :app="app"></fn-route-form>
    <fn-run-function :app="app"></fn-run-function>
  </div>
</template>

<script>
//import Modal from '../lib/vue-bootstrap-modal.vue';
import FnRouteForm from '../components/FnRouteForm';
import FnRunFunction from '../components/FnRunFunction';
import { eventBus } from '../client';
import { defaultErrorHandler } from '../lib/helpers';

export default {
  props: ['apps'],
  data: function(){
    return {
      app: {},
      routes: [],
      routesLoaded: false
    }
  },
  components: {
    FnRouteForm,
    FnRunFunction
  },
  methods: {
    openAddRoute: function(){
      eventBus.$emit('openAddRoute');
    },
    openEditRoute: function(route){
      eventBus.$emit('openEditRoute', route);
    },
    openRunFunction: function(route){
      eventBus.$emit('openRunFunction', route);
    },
    loadRoutes: function(){
      var t = this;
      $.ajax({
        url: '/api/apps/' + encodeURIComponent(t.app.name) + '/routes',
        dataType: 'json',
        success: function(routes){
          t.routes = routes;
          t.routesLoaded = true;
        },
        error: defaultErrorHandler
      })
    },
    loadApp: function(name, cb){
      var t = this;
      $.ajax({
        url: '/api/apps/' + encodeURIComponent(name),
        dataType: 'json',
        success: (app) => {t.app = app; if (cb) {cb()} },
        error: defaultErrorHandler
      })
    },
    deleteRoute: function(route){
      if (confirm('Are you sure you want to delete route ' + route.path + '?')) {
        var t = this;
        $.ajax({
          url: '/api/apps/' + encodeURIComponent(t.app.name) + '/routes/' + encodeURIComponent(route.path),
          method: 'DELETE',
          dataType: 'json',
          success: (app) => { t.loadRoutes() },
          error: defaultErrorHandler
        })
      }
    },
    setTitle: function(){
      document.title = this.app.name + " | Functions UI";
    },
    appLoaded: function(){
      this.routes = [];
      this.routesLoaded = false;
      this.loadRoutes();
      this.setTitle();
      eventBus.$emit('AppOpened', this.app);
    },
    appSwitched: function(){
      this.loadApp(this.$route.params.appname, () => { this.appLoaded(); });
    }
  },
  watch: {
    '$route': 'appSwitched'
  },
  beforeRouteEnter (to, from, next) {
    // access to component instance via `vm`
    next(vm => {
      if (vm.apps){
        vm.app = _.find(vm.apps, (app) => {return app.name == to.params.appname});
        vm.appLoaded();
      } else {
        vm.loadApp(to.params.appname, () => { vm.appLoaded(); });
      }
    })
  },
  destroyed: function(){
    eventBus.$emit('AppClosed');
  },
  created:  function (){
    eventBus.$on('RouteAdded', (route) => {
      this.loadRoutes()
    });
    eventBus.$on('RouteUpdated', (route) => {
      this.loadRoutes()
    });
  }
}
</script>

<style>

</style>
