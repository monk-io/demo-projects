import LeftSidebar from "./components/LeftSidebar"
import Feed from "./components/Feed"
import RightSidebar from "./components/RightSidebar"

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col lg:flex-row gap-4 p-4 max-w-7xl">
      <LeftSidebar />
      <Feed />
      <RightSidebar />
    </div>
  )
}

