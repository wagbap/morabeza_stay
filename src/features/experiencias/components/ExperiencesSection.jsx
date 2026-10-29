import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, ShieldCheck, Users } from 'lucide-react';
import CardExperiencia from './CardExperiencia';
import CardCarro from '../../carros/components/CardCarro';

const tiles = [
  { title: 'home_passeio_cultural', subtitle: 'home_passeio_historia', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Forte_Real_de_S%C3%A3o_Filipe%2C_Cidade_Velha%2C_Cape_Verde.jpg?width=800' },
  { title: 'home_passeio_natureza', subtitle: 'home_passeio_trilhos', image: 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1776894197/trekking-nas-montanhas-caminhada-da-montanha-os-turistas-com-trouxas-caminham-na-maneira-rochosa-perto-do-rio-natureza-selvagem-126682866_bank6i.webp' },
  { title: 'home_passeio_descobrir', subtitle: 'home_passeio_local', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Serra_Malagueta%2C_Ilha_de_Santiago%2C_Cabo_Verde_01.jpg?width=960' },
];

export default function ExperiencesSection({ carros = [], experiencias = [], loading = false }) {
  const { t } = useTranslation();
  const groups = [
    { title: 'home_carros_destaque', path: '/carros', data: carros, render: item => <CardCarro carro={item} /> },
    { title: 'home_experiencias_destaque', path: '/experiencias', data: experiencias, render: item => <CardExperiencia {...item} /> },
  ];
  const cultural = experiencias.find(item => item.slug === 'tour-cultural-cidade-velha');
  return <section className="mb-8 mt-14">
    <div className="mb-8">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{t('adicione_conforto_estadia')}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">{t('home_complemento_viagem')}</p>
    </div>
    {groups.map(group => <section key={group.path} className="mb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{t(group.title)}</h3>
        <Link to={group.path} className="flex items-center gap-2 text-sm font-semibold text-blue-600">{t('ver_todos')}<ArrowRight size={19} /></Link>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && !group.data.length ? Array.from({length: 3}, (_, i) => <div key={i} aria-busy="true" className="h-[480px] animate-pulse rounded-2xl bg-slate-100" />) : group.data.slice(0, 3).map(item => <React.Fragment key={item.id}>{group.render(item)}</React.Fragment>)}
      </div>
      {!loading && !group.data.length && <Link to={group.path} className="text-sm text-blue-600">{t('ver_todos')}</Link>}
    </section>)}
    <section>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900">{t('passeios_populares')}</h3>
      <p className="mb-2 mt-0.5 text-sm text-slate-600">{t('home_passeios_subtitulo')}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {tiles.map((tile, index) => <Link key={tile.title} to={index === 0 && cultural ? `/experiencia/${cultural.slug}` : '/experiencias'} className="group relative flex min-h-[210px] aspect-[3/2] items-end overflow-hidden rounded-lg bg-slate-900 p-4 text-white focus-visible:outline-2 focus-visible:outline-blue-600">
          <img src={tile.image} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/media/home-beach-29984774-poster.jpg"; }} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="relative"><h4 className="text-xl font-bold leading-tight tracking-tight">{t(tile.title)}</h4><p className="mt-1 text-sm text-white/90">{t(tile.subtitle)}</p><span className="sr-only">{t('explorar_passeios')}</span>{index === 2 && <span className="mt-2 inline-flex items-center gap-3 rounded-full bg-green-500 px-4 py-1.5 text-xs font-bold uppercase text-white transition-colors group-hover:bg-green-600">{t('explorar_passeios')}<ArrowRight size={18} /></span>}</div>
        </Link>)}
      </div>
      <p className="mt-2 text-[10px] text-slate-400"><a href="https://commons.wikimedia.org/wiki/File:Forte_Real_de_S%C3%A3o_Filipe,_Cidade_Velha,_Cape_Verde.jpg" target="_blank" rel="noreferrer">{t('home_foto_cidade_credito')}</a>{' | '}<a href="https://commons.wikimedia.org/wiki/File:Serra_Malagueta,_Ilha_de_Santiago,_Cabo_Verde_01.jpg" target="_blank" rel="noreferrer">GualdimG / Wikimedia Commons</a>{' ? '}<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p>
    </section>
    <div className="mt-6 grid gap-4 rounded-xl bg-blue-50 px-5 py-5 text-blue-700 sm:grid-cols-3">
      {[{icon: CreditCard, label: 'home_pagamento_seguro'}, {icon: ShieldCheck, label: 'home_parceiros_verificados'}, {icon: Users, label: 'home_apoio_local'}].map(({icon: Icon, label}) => <div key={label} className="flex items-center justify-center gap-3 text-sm font-medium">{React.createElement(Icon, { size: 25, strokeWidth: 1.6 })}{t(label)}</div>)}
    </div>
  </section>;
}
