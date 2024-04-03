const styles = {
  container: {
    alignItems: 'center' as const,
    background: 'black',
    backgroundSize: '100% 100%',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flexWrap: 'nowrap' as const,
    height: '100%',
    justifyContent: 'center' as const,
    textAlign: 'center' as const,
    width: '100%',
  },
  question: {
    fontSize: "2.5rem",
    fontWeight: "600",
    color: "white",
  },
  optionsContainer: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    justifyContent: 'flex-start' as const,
    justifyItems: 'start' as const,
    paddingLeft: '17%',
    gridGap: "4",
  },
  option: {
    alignItems: "center" as const,
    display: "flex" as const,
    gap: "2",
  },
  optionIndicator: {
    border: "1px solid #E5E7EB",
    borderColor: "#E5E7EB",
    borderRadius: "9999px",
    display: "flex",
    height: "1rem",
    width: "1rem",
  },
  optionText: {
    fontSize: "2rem",
    color: "white",
    paddingLeft: "0.5rem",
  }
};

export default styles;