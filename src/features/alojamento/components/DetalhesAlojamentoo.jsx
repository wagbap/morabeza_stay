import React from 'react';
import { InfoAlojamento } from '../../../pages/InfoAlojamento';
import { SidebarReserva } from './SidebarReservaAlojamnetos';
import { HostInfo } from './HostInfoAlojamento';
import { MapLocation } from './MapLocationAlojamento';

const DetalhesPagina = () => {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-[1400px] mx-auto p-4 md:p-8">
        {/* items-start é fundamental para o sticky funcionar corretamente */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* COLUNA ESQUERDA (Info, Galeria, etc) */}
          <div className="flex-1 w-full">
            <InfoAlojamento />
          </div>

          {/* COLUNA DIREITA (O GRUPO QUE FICA FIXO) */}
          {/* Aqui definimos que este bloco inteiro é sticky */}
          <aside className="w-full lg:w-[400px] flex flex-col gap-6 sticky top-8 z-20">
            <SidebarReserva />
            <HostInfo />
            <MapLocation />
          </aside>

        </div>
      </main>
    </div>
  );
};

export default DetalhesPagina;