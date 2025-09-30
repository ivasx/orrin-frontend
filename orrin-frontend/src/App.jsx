import Header from "./components/Header.jsx";
import TrackCard from "./components/TrackCard/TrackCard.jsx";
import {ways} from "./data"
import TrackSection from "./components/TrackSection/TrackSection.jsx";
import MusicSectionWrapper from "./components/TrackSection/MusicSectionWrapper.jsx";
import {AudioPlayerProvider} from "./components/AudioPlayerContext/AudioPlayerContext.jsx";
import BottomPlayer from "./components/AudioPlayerContext/BottomPlayer.jsx";


export default function App() {
    return (
        <div className="AppContainer">
            <AudioPlayerProvider>
                <div>
                    <Header/>

                    <main>
                        <MusicSectionWrapper spacing="top-only">
                            <TrackSection
                                title="Слухати зараз"
                                tracks={ways}
                                onMoreClick={() => console.log("Більше натиснуто")}
                            />
                        </MusicSectionWrapper>
                        <MusicSectionWrapper spacing="top-only">
                            <TrackSection
                                title="Популярні виконавці"
                                tracks={ways}
                                onMoreClick={() => console.log("Більше натиснуто")}
                            />
                        </MusicSectionWrapper>
                    </main>
                </div>
                <BottomPlayer/>
            </AudioPlayerProvider>
        </div>
    )
}