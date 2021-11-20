const { widget } = figma
const { AutoLayout, Ellipse, Frame, Image, Rectangle, SVG, Text{{importUsePropertyMenu}} } = widget

function Widget() {
  {{{propertyMenuCode}}}

  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      height="hug-contents"
      padding={8}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={12}
    >
      <Text fontSize={32} horizontalAlignText="center">
        Hello Widgets
      </Text>
    </AutoLayout>
  )
}
widget.register(Widget)
