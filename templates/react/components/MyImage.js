import { Image } from 'antd'

export const MyImage = ({ img, setImg }) => {
    return (
        <div style={{ display: 'none' }}>
            <Image.PreviewGroup preview={{ visible: img.visible, onVisibleChange: vis => setImg({ ...img, visible: vis }) }}>
                {img.list.map((src, index) => (<Image key={index} src={src} />))}
            </Image.PreviewGroup>
        </div>
    )
}
