import { memo } from 'react';

/**
 * DemoContent is a React component used to render a demo content on the page.
 * It renders a image on the page followed by a heading, some text and a footer.
 * It also renders a quote and some content about a person being transformed into a vermin.
 */
function DemoContent2() {
	return (
		<div>
			<img
				src="assets/images/demo-content/morain-lake.jpg"
				alt="beach"
				style={{
					maxWidth: '640px',
					width: '100%'
				}}
				className="rounded-6"
			/>
			<h1 className="py-16 font-semibold">Early Sunrise</h1>
			<h4 className="pb-12 font-medium">Demo Content</h4>
			<p>
				One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a
				horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his
				brown belly, slightly domed and divided by arches into stiff sections.
			</p>
			
			
		</div>
	);
}

export default memo(DemoContent2);
