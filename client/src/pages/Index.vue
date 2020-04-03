<template>
   <div style="width:90%;max-width:768px;margin:auto;">
    <h4 class="q-mb-auto  q-mt-md">Consulta de números de teléfono</h4>
    <q-slide-transition>
      <div class="q-mb-md q-mt-md" v-show="visibleSearch">
        <q-form  @submit="makeSearch">
          <div class=" q-col-gutter-x-md q-col-gutter-y-md row">

            <!--v-bind:class="{ 'col-6': phones.length,'col-12': !phones.length}"-->
            <div  class="col-12">
              <q-input required v-model="query.street"  label="Calle" hint="Ej: Urquiza" />
            </div>

            <div class="col-6">
              <q-input required type="number" min="0" v-model="query.start_number" hint="Ej: 1700" label="Desde (altura)" />
            </div>

            <div class="col-6">
              <q-input required type="number" min="0" v-model="query.end_number" hint="Ej: 1799" label="Hasta (altura)" />
            </div>

            <div class="col-12">
              <q-input required v-model="query.province" hint="Ej: Entre Rios" label="Provicia" />
            </div>


            <div class="col-12 q-mb-md">
              <q-input required v-model="query.zip_code" hint="Ej: 3100" label="Código postal" />
            </div>

            <div class="col-12">
                    <q-btn type="submit" :loading="loading"  label="Buscar" class="full-width" color="primary" icon-right="search" />
            </div>

              <!--
            <div class="row  q-col-gutter-x-md">
              <div class="col-sm-6 col-xs-12">
                <q-input v-model="text" label="Desde" />
              </div>
              <div class="col-sm-6 col-xs-12">
                <q-input v-model="text" label="Hasta" />
              </div>
            </div>-->


          </div>

        </q-form>

      </div>
    </q-slide-transition>



    <div class="phone-list" v-if="phones.length || loading" >

      <span class="title q-pb-md q-pt-md">Mostrando resultados ({{phones.length}})</span>

      <div class="phone bg-grey-3 shadow-1 q-mb-md" v-for="phone in phones">
        <div class="section">
          <span class="name">{{phone.name}}</span>
          <span class="address">{{phone.address}}</span>
        </div>
        <div class="section">
          <span class="show-phone" v-if="!visiblePhones[phone.phone_number]"><q-btn size="sm" @click="setVisiblePhone(phone.phone_number)" color="green" round   icon="phone"  /></span>
          <span class="phone-number text-primary" v-else>{{phone.phone_number}}</span>
        </div>
      </div>

      <div v-if="loading" class="q-pa-md bg-grey-3">
        <q-skeleton square width="100%" />
        <q-skeleton type="text" width="50%" class="text-subtitle1" />
      </div>

    </div>

    <!--
    <q-list v-if="phones.length" bordered padding separator >

     <q-item  v-for="phone in phones" :key="phone.number"  >

       <q-item-section>
         <q-item-label overline>{{phone.name}}</q-item-label>
         <q-item-label>{{phone.address}}</q-item-label>

       </q-item-section>

       <q-item-section side top >
          <q-item-label caption v-if="!visiblePhones[phone.number]" ><q-btn size="sm" @click="setVisiblePhone(phone.number)" color="green" round   icon="phone"  /></q-item-label>
          <q-item-label caption v-else >{{phone.phone_number}}</q-item-label>
       </q-item-section>


     </q-item>

   </q-list>-->

  </div>


</template>
<style scoped lang="scss">
  .phone-list {
    //max-height: 30vh;
    //overflow: auto;
    .title {
      font-size: 1.5rem;
      display: block;
      top: 0;
      position: sticky;
      background: white;
      z-index: 2;
    }
    .phone {
      span {display: block}
      .phone-number { font-weight: 600;}
      .name {margin-bottom: 0.75rem;font-weight: 600; font-size: 1.2rem; }
      display: grid;
          grid-template-columns: 1fr auto;
      padding: 1rem;
    }
  }
</style>
<script>
import $ from "jquery";
import { Notify } from 'quasar';
import axios from 'axios';

import hyperquest from "hyperquest";
import pump from 'pump';
import ndjson from 'ndjson';
import through from 'through2';


export default {
  name: 'PageIndex',
  data(){
    return {
      searchLimit: 300,
      visiblePhones:{},
      visibleSearch:true,
      loading:false,
      phones:[/*{"name":"Rosenbrock Dario D","phone_number":"(343) 442 - 4758","address":"Gran Chaco 7","province":"Entre Rios","zip_code":"3100"}*/
      ],
      query:{
        province:this.$route.query.province,
        zip_code:this.$route.query.zip_code,
      }
    }
  },
  methods: {
    setVisiblePhone(number){
      this.$set(this.visiblePhones,number,true);
    },
    async makeSearch(){
      if(this.closeNoResultsNotification)
      {
        this.closeNoResultsNotification();
      }

      if(this.query.end_number - this.query.start_number > this.searchLimit) {
        Notify.create({type:'negative',timeout:2500, message:`El límite de búsqueda son ${this.searchLimit} números`,actions: [{ color:'white',icon: 'close' }]});
        this.loading = false;
        return;
      }

      this.loading = true;
      this.phones = [];
      pump(
        hyperquest(`${process.env.API_URL}/phone?street=${this.query.street}&start_number=${this.query.start_number}&end_number=${this.query.end_number}&zip_code=${this.query.zip_code}&province=${this.query.province}`),
        ndjson.parse(),
        through.obj((row, enc, next)=>{
          //let idx = this.phones.findIndex()
          this.phones.push(row);
          next()
        }),
        ()=>{
          if(!this.phones.length){
            this.closeNoResultsNotification = Notify.create({
            message:"No se encontraron resultados. Recuerde escribir el nombre de la calle de forma simplificada",
            text:'white',
            actions: [{ color:'white',icon: 'close' }]})
          }
          else {
            Notify.create({type:'positive',timeout: 2500,message:`${this.phones.length} resultados encontrados`});
          }
          this.loading=false;
        }
      )


      /*
      try {




      } catch (error) {
        if(!error.response || error.response.status != 400) {
          Notify.create({message:'Error al realizar la búsqueda. Inténtelo más tarde',type:'negative'})
        }
        else {

        }
      }*/

      //this.loading = false;

    }
  }
}
</script>
