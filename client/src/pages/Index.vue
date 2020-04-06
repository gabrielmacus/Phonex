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


            <div class="col-12 ">
              <q-input  required v-model="query.zip_code" hint="Ej: 3100" label="Código postal" />
            </div>

            <div class="col-12 q-mb-md">
              <q-input   v-model="query.spreadsheetUrl" label="Link Google Sheets (opcional)" hint="Hoja de cálculo de Google a donde volcar los datos" />
            </div>



            <div class="col-12">
                    <q-btn type="submit" :loading="loading"  label="Buscar"  class="full-width" color="primary" icon-right="search" />
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
          <span class="show-phone" v-if="!phone.phone_number_shown"><q-btn size="sm" @click="setVisiblePhone(phone)" color="green" round   icon="phone"  /></span>
          <span class="phone-number text-primary" v-else>{{phone.phone_number}}</span>
        </div>

        <div class="section q-mt-md">
          <q-select @input="phoneDataChanged(phone,0)"
                    standout="bg-grey-7"
                    map-options
                    emit-value
                    v-model="phone.status"
                    :options="statusOptions"
                    placeholder="Estado" >
          </q-select>
        </div>

        <div class="section q-mt-md">
          <q-input
                  placeholder="Observaciones"
                  @input="phoneDataChanged(phone,3000)"
                  v-model="phone.details"
                  filled
                  autogrow
          />
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

      .section:nth-child(3),.section:nth-child(4){
        grid-column: 1 / span 2
      }
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
      //changedPhones:{},
      saveTimeouts:{},
      statusOptions:[
          {
              label: 'Sin registro',
              value: 0,
          },
          {
              label: 'Atendió',
              value: 1,
          },
          {
              label: 'Llamar en otro momento',
              value: 2,
          },
          {
              label: 'No llamar',
              value: 3,
          },
          {
              label: 'No contesta',
              value: 4,
          },
          {
              label: 'Contestador',
              value: 5,
          },
          {
              label: 'Fue llamado',
              value: 6,
          }
          ,
          {
              label: 'Revisita',
              value: 7,
          },
          {
              label: 'Fuera de servicio',
              value: 8,
          },



      ],
      searchLimit: 300,
      //visiblePhones:{},
      visibleSearch:true,
      loading:false,
      phones:[/*{"name":"Rosenbrock Dario D","phone_number":"(343) 442 - 4758","address":"Gran Chaco 7","province":"Entre Rios","zip_code":"3100"}*/
      ],
      query:{
        spreadsheetUrl:this.$route.query.spreadsheetUrl,
        spreadsheetId:"",
        spreadsheetSheet:"0",
        province:this.$route.query.province,
        zip_code:this.$route.query.zip_code,
      }
    }
  },
  mounted(){

  },
  methods: {
    async phoneDataChanged(phone,saveDelay){

        if(this.saveTimeouts[phone.phone_number])
        {
         clearTimeout(this.saveTimeouts[phone.phone_number]);
        }
        this.saveTimeouts[phone.phone_number] = setTimeout(async ()=>{
            try {

                let response;
                if(phone.id){
                    response = await axios.patch(`${process.env.API_URL}/phone/${phone.id}`, phone);
                }
                else {
                    response = await axios.post(`${process.env.API_URL}/phone`, phone);
                }

                let idx = this.phones.findIndex((el)=>{return el.phone_number == phone.phone_number});

                if(idx > -1)
                {
                    this.$set(this.phones[idx],'id',response.data.id);
                    this.$set(this.phones[idx],'status',response.data.status);
                    this.$set(this.phones[idx],'details',response.data.details);
                }

                Notify.create({
                    type:'positive',
                    message:'Cambios guardados correctamente',
                    timeout:3000
                });
            }
            catch (err)
            {
                console.log(err);
                Notify.create({
                    type:'negative',
                    message:'Error al guardar los cambios. Reinténtelo nuevamente',
                    timeout:1500
                });
            }
            delete this.saveTimeouts[phone.phone_number];
        },saveDelay);

        /*
        if(this.phoneStatusChangedTimeout){
            clearTimeout(this.phoneStatusChangedTimeout);
        }

        this.$set(this.changedPhones,phone.phone_number,phone);

        this.phoneStatusChangedTimeout = setTimeout(async ()=>{
            try {

                for(const phone of Object.values(this.changedPhones)){
                    let response;
                    if(phone.id){
                        response = await axios.put(`${process.env.API_URL}/phone/${phone.id}`, phone);
                    }
                    else {
                        response = await axios.post(`${process.env.API_URL}/phone`, phone);
                    }

                    let idx = phones.findIndex((el)=>{return el.phone_number == phone.phone_number});
                    this.$set(this.phones[idx],'id',response.data.id);
                }

                Notify.create({
                    type:'positive',
                    message:'Cambios guardados correctamente',
                    timeout:3000
                });
                this.changedPhones = {};
            }
            catch (err)
            {
                console.log(err);
                Notify.create({
                    type:'negative',
                    message:'Error al guardar los cambios. Reinténtelo nuevamente',
                    timeout:3000
                })
            }
        },3000);*/
    },

    async loadPhonesData(){
        this.loading = true;
        let phone_numbers = this.phones.map((phone)=>{return phone.phone_number});
        let url = `${process.env.API_URL}/phone/?where={"phone_number":{"in":${JSON.stringify(phone_numbers)}}}`;
        let response = await axios.get(url);

        response.data.forEach((phone)=>{
            let idx = this.phones.findIndex((el)=>{return el.phone_number == phone.phone_number; });
            this.$set(this.phones,idx,phone);
        });
        this.loading = false;
    },
    setVisiblePhone(phone){

      phone.phone_number_shown = true;
      this.phoneDataChanged(phone,0);
      //this.$set(this.visiblePhones,phone.phone_number,true);
    },
    async makeSearch(){

      if(this.query.spreadsheetUrl && !this.query.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)){
        Notify.create({type:'negative',timeout:3500, message:`Ingrese la url de Google Sheets correctamente`,actions: [{ color:'white',icon: 'close' }]});
        return ;
      }

      if(this.query.spreadsheetUrl){
        this.query.spreadsheetId = this.query.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,"")[1];

        //Si tiene una hoja en particular la url la extraigo
        if(this.query.spreadsheetUrl.match(/[#&]gid=([0-9]+)/))
        this.query.spreadsheetSheet = this.query.spreadsheetUrl.match(/[#&]gid=([0-9]+)/)[1];
      }

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


      let request = hyperquest(`${process.env.API_URL}/phone/search?street=${this.query.street}&start_number=${this.query.start_number}&end_number=${this.query.end_number}&zip_code=${this.query.zip_code}&province=${this.query.province}&spreadsheetId=${this.query.spreadsheetId}&spreadsheetSheet=${this.query.spreadsheetSheet}`);

      request
      .pipe(ndjson.parse())
      .pipe(through.obj(async (row,enc,next)=>{

        if(row.phone_number)
        {
          //row.status = !row.status ? 0 : row.status;

          try{
              //
              let response = await axios.get(`${process.env.API_URL}/phone/?phone_number=${row.phone_number}`);
              if(response.data.length)
              {
                  row = response.data[0];
              }
          }
          catch (err)
          {

          }
            row.status = !row.status ? 0 : row.status;

          this.phones.push(row);

        }
        else {
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

          if(row.error && !row.type) {
              Notify.create({type:'negative',timeout: 2500,message:`Hubo un error al procesar uno o más resultados. Inténte buscar nuevamente`});
          }
          else if(row.error && row.type == 'spreadsheet-error'){
              Notify.create({type:'negative',timeout: 5000,message:`Error al guardar los datos en Google Sheets. Verifique que la hoja exista y que tenga los permisos correspondientes`});
          }

        }
        next()
      }))

      request.on('end',(e)=>{
        console.log("");
      });
      /*
       pump(

        hyperquest(`${process.env.API_URL}/phone?street=${this.query.street}&start_number=${this.query.start_number}&end_number=${this.query.end_number}&zip_code=${this.query.zip_code}&province=${this.query.province}&spreadsheetId=${this.query.spreadsheetId}&spreadsheetSheet=${this.query.spreadsheetSheet}`),
        ndjson.parse(),
        through.obj((row, enc, next)=>{


        console.log(row);

          //let idx = this.phones.findIndex()
          if(row.phone_number)
          {
            this.phones.push(row);
          }

          next(row)
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
      )*/


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
