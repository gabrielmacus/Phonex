<template>
  <q-page class="flex flex-center">

  <div style="width:90%;max-width:400px">

    <q-form @submit="makeSearch">
      <div class=" q-mb-lg  q-col-gutter-y-sm">
        <q-input v-model="query.street"  label="Calle" hint="Ej: Urquiza" />
        <q-input v-model="query.number" hint="Ej: 1700. Se consultará toda la cuadra a partir del nº" label="Altura" />
        <!--
        <div class="row  q-col-gutter-x-md">
          <div class="col-sm-6 col-xs-12">
            <q-input v-model="text" label="Desde" />
          </div>
          <div class="col-sm-6 col-xs-12">
            <q-input v-model="text" label="Hasta" />
          </div>
        </div>-->

        <q-input v-model="query.zip_code" hint="Ej: 3100" label="Código postal" />

      </div>

      <q-btn type="submit" :loading="loading"  label="Buscar" class="full-width" color="primary" icon-right="search" />
    </q-form>
  </div>


  </q-page>
</template>

<script>
import $ from "jquery";

import { Notify } from 'quasar'
import axios from 'axios';
export default {
  name: 'PageIndex',
  data(){
    return {
      loading:false,
      query:{
        street:"",
        number:"",
        zip_code:3100,
      }
    }
  },
  methods: {
    async makeSearch(){
      this.loading = true;

      try {
        let response = await axios.get('http://localhost:1337/phone/',this.query);
        console.log(response);




      } catch (error) {
        if(!error.response || error.response.status != 400) {
          Notify.create({message:'Error al realizar la búsqueda. Inténtelo más tarde',type:'negative'})
        }
        else {

        }
      }

      this.loading = false;

    }
  }
}
</script>
