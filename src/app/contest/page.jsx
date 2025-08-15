'use client'
import React, {useEffect, useState} from 'react';
import 'react-photo-view/dist/react-photo-view.css';
import useSWR from 'swr';
import { apiroot1 } from '../apiroot';
import Tippy, { useSingleton } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import LazyLoad from "react-lazy-load";
import {setLanguage, loc} from "../utils";
import {CoverPic, Majdata, PageLayout} from "../widgets";

export default function Page() {
  const [source, target] = useSingleton();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setLanguage(localStorage.getItem("language")||navigator.language).then(() => {
      setReady(true);
    });
  }, []);

  if (!ready) return <div className="loading"></div>;
  
  const navigationItems = [
    { href: "../", label: loc("Back") }
  ];

  return (
    <PageLayout 
      title="MMFC"
      navigationItems={navigationItems}
      className="contest-page"
      showBackToHome={true}
    >
      {/* MMFC官网按钮 */}
      <div className="mmfc-official-section">
        <div className="mmfc-official-container">
          <a 
            href="https://www.maimaimfc.ink/precontest" 
            target="_blank" 
            rel="noreferrer"
            className="mmfc-official-button"
          >
            <span className="mmfc-button-text">{loc("MMFCOfficialButton")}</span>
          </a>
        </div>
      </div>
      
      <Majdata />
      <Tippy singleton={source} animation='fade' placement='top-start' interactive={true} />
      <TheList tippy={target} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img className="footerImage" style={{ width: "150px" }} loading="lazy" src={"/xxlbfooter.webp"} alt="" />
      </div>
    </PageLayout>
  )
}

function Levels({ levels, songid, onClick }) {
  for (let i = 0; i < levels.length; i++) {
    if (levels[i] == null) {
      levels[i] = "-"
    }
  }
  const scrollToTop = () => {
    let sTop = document.documentElement.scrollTop || document.body.scrollTop
    if (sTop > 0.1) {
      window.requestAnimationFrame(scrollToTop)
      window.scrollTo(0, sTop - sTop / 9)
    }
  }

  const levelClickCallback = e => {
    scrollToTop()
    onClick()
    const maichart = apiroot1 + "/maichart/" + songid
    const maidata = maichart + "/chart"
    const track = maichart + "/track"
    const bg = maichart + "/image"
    const mv = maichart + "/video"
    window.unitySendMessage(
      "HandleJSMessages",
      "ReceiveMessage",
      maidata + "\n" + track + "\n" + bg + "\n" + mv + "\n" + e.target.id
    );
  }
  return (
    <>
      <div className='songLevel' id="lv0" style={{ display: levels[0] == '-' ? 'none' : 'unset' }} onClick={levelClickCallback}>{levels[0]}</div>
      <div className='songLevel' id="lv1" style={{ display: levels[1] == '-' ? 'none' : 'unset' }} onClick={levelClickCallback}>{levels[1]}</div>
      <div className='songLevel' id="lv2" style={{ display: levels[2] == '-' ? 'none' : 'unset' }} onClick={levelClickCallback}>{levels[2]}</div>
      <div className='songLevel' id="lv3" style={{ display: levels[3] == '-' ? 'none' : 'unset' }} onClick={levelClickCallback}>{levels[3]}</div>
      <div className='songLevel' id="lv4" style={{ display: levels[4] == '-' ? 'none' : 'unset' }} onClick={levelClickCallback}>{levels[4]}</div>
      <div className='songLevel' id="lv5" style={{ display: levels[5] == '-' ? 'none' : 'unset' }} onClick={levelClickCallback}>{levels[5]}</div>
      <div className='songLevel' id="lv6" style={{ display: levels[6] == '-' ? 'none' : 'unset' }} onClick={levelClickCallback}>{levels[6]}</div>
    </>
  )
}

function SearchBar({ onChange }) {
  return (
    <div className='searchDiv'>
      <input type='text' className='searchInput' placeholder='Search' onChange={onChange} />
    </div>);
}

const fetcher = (...args) => fetch(...args).then((res) => res.json())

function TheList({ tippy }) {
  const { data, error, isLoading } = useSWR(apiroot1 + "/maichart/list", fetcher);
  const [filteredList, setFilteredList] = new useState(data);
  const [desInfo, setDesInfo] = new useState("点击难度载入谱面哟");
  if (error) return <div className='notReady'>{loc("ServerError")}</div>;
  if (isLoading) {
    return <div className='loading'></div>;
  }

  data.sort((a, b) => { return b.id - a.id; });

  const filterBySearch = (e) => {
    let dataf = data.filter(o => (
      o.Designer?.toLowerCase().includes(e.target.value.toLowerCase()) ||
      o.Title?.toLowerCase().includes(e.target.value.toLowerCase()) ||
      o.Artist?.toLowerCase().includes(e.target.value.toLowerCase()) ||
      o.Levels.some(i => i == e.target.value) ||
      o.Id == e.target.value
    ));
    setFilteredList(dataf);
  };

  if (filteredList === undefined) {
    setFilteredList(data);
    return <SearchBar onChange={filterBySearch} />;
  }

  const list = filteredList.map(o => (
    <div key={o.id}>
      <LazyLoad height={165} width={352} offset={300}>
        <div className="songCard">
          <CoverPic id={o.id} />
          <div className='songInfo'>
            <Tippy content={o.title} singleton={tippy}>
              <div className='songTitle' id={o.id}>{o.title}</div>
            </Tippy>
            <Tippy content={o.artist} singleton={tippy}>
              <div className='songArtist'>{o.artist === "" || o.artist == null ? "-" : o.artist}</div>
            </Tippy>
            <Tippy content={o.designer} singleton={tippy}>
              <div className='songDesigner'>{o.designer === "" || o.designer == null ? "-" : o.designer}</div>
            </Tippy>
            <Levels levels={o.levels} songid={o.id} onClick={() => setDesInfo(o.description)} />
          </div>
        </div>
      </LazyLoad>
    </div>));
  // 渲染数据
  return (<>
    <div className="songDescription">留言<br />{desInfo}</div>
    <SearchBar onChange={e => filterBySearch(e)} />
    <div className='theList'>{list}</div>
  </>);
}