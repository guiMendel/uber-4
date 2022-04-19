import './SideMenu.css'
import Button from '../Button/Button'
import { useState } from 'react'
import seedGraph from '../../helpers/seedGraph'

import { CgSidebarOpen } from 'react-icons/cg'
import { BiCopyright } from 'react-icons/bi'
import { RiRoadMapFill, RiMapLine, RiGithubFill } from 'react-icons/ri'

const SideMenu = () => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    console.log(showMenu);
  }

  return (
    <section className="menu">
      <div className={`show-menu-${showMenu}`}>
        <Button name={'toggle-menu'} help={'Fechar/Abrir Menu'} onClick={() => toggleMenu()}>
          <CgSidebarOpen />
        </Button>
        <div className='options'>
          <h2>Novo Mapa</h2>
          <span onClick={() => {}}><RiMapLine/>Em branco</span>
          <span onClick={() => {}}><RiRoadMapFill/>Gerar aleatóriamente</span>
        </div>
        <div className='credits'>
          <h4>Créditos</h4>
          <span className='name'>Estevan Alexander</span>
          <span className='name'>Guilherme Mendel</span>
          <span className='name'>Rodrigo Xavier</span>
          <span className='name'>Matheus Feitosa</span>
          <span className='name'>Daniel Carvalho</span>
          <span className='name'>David Mendes</span>
          <span className='name'>Gabriel Rospan</span>
          <span className='name'>Gabriel Carvalho</span>
          <span className='copyright'><BiCopyright/><p>2022 PAA Uber 4</p></span>
          <a href='https://github.com/guiMendel/uber-4' target='_blank' rel='noreferrer'><span><RiGithubFill/>Repostório</span></a>
        </div>
      </div>
    </section>
  )
}

export default SideMenu